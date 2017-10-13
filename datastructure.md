# Boards.json

### Location: ${appDirectory}/boards.json

```json
[
    { // A quiz
        "name" : "Quiz name",
        "categories" : [ // Categories on top, limit of 5
            // ...   
        ],
        "values" : {
            "100" : { // $100 questions
                "1" : [ // Question/answer for category 1
                    ["Question 1", "Answer for Question 1"]
                ],
                "2" : [],
                "3" : [],
                "4" : [],
                "5" : []
            }
            // Continue for 200, 300, 400, 500
        }
    }
]
```