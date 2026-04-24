import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function getUserIdFromCookie(request: NextRequest): string | null {
  // Try fortune_device_id cookie first (anonymous users)
  const deviceId = request.cookies.get('fortune_device_id')?.value;
  if (deviceId) return deviceId;

  // Try user_id cookie if exists (logged in users)
  const userId = request.cookies.get('user_id')?.value;
  if (userId) return userId;

  return null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromCookie(request);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return new NextResponse('Content-Type must be application/json', { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, feedbackNote } = body;

    // Validate status
    if (!status || !['accurate', 'inaccurate'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "accurate" or "inaccurate"' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify the prediction exists and belongs to this user
    const prediction = db.prepare(
      'SELECT * FROM predictions WHERE id = ? AND user_id = ?'
    ).get(id, userId);

    if (!prediction) {
      return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
    }

    // Update prediction status and feedback_note
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE predictions
      SET status = ?, feedback_note = ?, updated_at = ?
      WHERE id = ?
    `).run(status, feedbackNote || null, now, id);

    // Get the prediction's dimension
    const updatedPrediction = db.prepare('SELECT * FROM predictions WHERE id = ?').get(id) as {
      id: string;
      user_id: string;
      dimension: string;
      status: string;
    };

    // Update user_prediction_profile accuracy
    const dimension = updatedPrediction.dimension;
    const accuracyField = `${dimension}_accuracy`;

    // Get or create the user's prediction profile
    let profile = db.prepare(
      'SELECT * FROM user_prediction_profiles WHERE user_id = ?'
    ).get(userId) as Record<string, unknown> | undefined;

    if (!profile) {
      // Create profile if it doesn't exist
      db.prepare(`
        INSERT INTO user_prediction_profiles (user_id, ${accuracyField}, total_predictions, last_feedback_at)
        VALUES (?, ?, 1, ?)
      `).run(userId, status === 'accurate' ? 1 : 0, now);
    } else {
      // Update existing profile
      const totalPredictions = (profile.total_predictions as number) + 1;
      const currentAccuracy = (profile[accuracyField] as number) || 0;

      // Calculate new accuracy: (old_acc * (total-1) + (accurate ? 1 : 0)) / total
      const newAccuracy = status === 'accurate'
        ? (currentAccuracy * (totalPredictions - 1) + 1) / totalPredictions
        : (currentAccuracy * (totalPredictions - 1)) / totalPredictions;

      db.prepare(`
        UPDATE user_prediction_profiles
        SET ${accuracyField} = ?,
            total_predictions = ?,
            last_feedback_at = ?
        WHERE user_id = ?
      `).run(newAccuracy, totalPredictions, now, userId);
    }

    // Return updated profile
    const updatedProfile = db.prepare(
      'SELECT * FROM user_prediction_profiles WHERE user_id = ?'
    ).get(userId);

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}
