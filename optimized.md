 AI 算命

优化1：缩短每个字段长度

- 80-100字 → 30-60字

- 总输出量减少约60%
  
  优化2：精简发送的八字数据

- 不再发送 fortuneLines 和 yearlyFortune 给AI

- 减少大量token
  
  保留全部字段：overall, career, careerSuggest, mentorDirection, love, spouseDesc, marriageAdvice, wealth, health, fortune, yearly, luckyElements(4子字段),
  nameSuggestions(2子字段)
