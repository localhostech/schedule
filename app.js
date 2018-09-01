var schedule = {
	'пн': [
		['Математика 1-105', 'Философия 1-513', 'Химия 1-522']
	],
	'вт': [
		['Физвоспитание', 'Математика 1-420', 'БЖД 3-502', 'РЯиКР 1-106']
	],
	'ср': [
		['Химия 3-3', 'Экономика 7-503', 'Философия 1-2', 'Экономика 3-3']
	],
	'чт': [
		['Физвоспитание']
	],
	'пт': [
		['Английский - 7-213, Немецкий - 7-419', 'ИТ 1 группа 3-410', 'ИТ 1 группа 3-410', 'ИТ (лек) 3-410']
	]
}
function getWeekDay(date) {
  var days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  return days[date.getDay()+1];
}

var apiai = require('apiai');

var app = apiai("6e7a7d2654d548b587eb9658ed5a2ac0"); 

const {VKApi, ConsoleLogger, BotsLongPollUpdatesProvider} = require('node-vk-sdk');

let api = new VKApi({
    token: '87b2feba4e2592a00d170265da4f46492fb13abfcfbd3265f22914b71dea24d87145b8272d3fc9fef56f8',
    logger: new ConsoleLogger()
});

let updatesProvider = new BotsLongPollUpdatesProvider(api, '170828570');
var keyboard = {"one_time": false, 
    "buttons": [ 
      [{ 
        "action": { 
          "type": "text", 
          "payload": "{\"button\": \"1\"}", 
          "label": "Понедельник" 
        }, 
        "color": "primary" 
      },{ 
        "action": { 
          "type": "text", 
          "payload": "{\"button\": \"2\"}", 
          "label": "Вторник" 
        }, 
        "color": "primary" 
      },{ 
        "action": { 
          "type": "text", 
          "payload": "{\"button\": \"3\"}", 
          "label": "Среда" 
        }, 
        "color": "primary" 
      }], 
      [{ 
        "action": { 
          "type": "text", 
          "payload": "{\"button\": \"4\"}", 
          "label": "Четверг" 
        }, 
        "color": "primary" 
      },{ 
        "action": { 
          "type": "text", 
          "payload": "{\"button\": \"5\"}", 
          "label": "Пятница" 
        }, 
        "color": "primary" 
      },{ 
        "action": { 
          "type": "text", 
          "payload": "{\"button\": \"6\"}", 
          "label": "Суббота" 
        }, 
        "color": "primary" 
      }]
    ]}
updatesProvider.getUpdates(updates => {
    console.log('got updates: ', updates)

    if (updates.length > 0) {
      var message = updates[0].object.body;
      var userId = updates[0].object.user_id;
      
      var api_request = app.textRequest(message, {
	    sessionId: userId
	  });

	  api_request.on('response', function(response) {
	    console.log(response);
	    if (response.result.action == 'getLesson' && !response.result.actionIncomplete) {
	    	console.log(response.result.parameters.date);
	    	var date = new Date(response.result.parameters.date); // 3 января 2014

	    	var day = getWeekDay(date);

	    	if (schedule[day]) {
	    		var lessons = schedule[day][0];


	    		var lessonStr = "Расписание "+day+": \n\n";

	    		lessonStr += lessons.join(';\n');

	    		lessonStr += "\n\nнеделя над чертой";

	    	} else {
	    		var lessonStr = "На этот день расписания нет 😞. Может стоит отдохнуть?";
	    	}

	    	api.call('messages.send', {'user_id':userId, 'message': lessonStr, keyboard: JSON.stringify(keyboard)})
	    } else {
	    	    api.call('messages.send', {'user_id':userId, 'message': response.result.fulfillment.speech, keyboard: JSON.stringify(keyboard)})
	    }
	    
	  });

	  api_request.on('error', function(error) {
	    console.log(error);
	  });

	  api_request.end();
	  
    }
});

