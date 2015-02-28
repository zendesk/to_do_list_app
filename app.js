(function() {

	return {
		to_do_object: {},

		requests: {
			getFieldData: function(user_id) {
				return {
					url: helpers.fmt('/api/v2/users/%@.json', user_id),
					type: 'GET'
				};
			},
			updateFieldData: function(user_id, json_string) {
				return {
					url: helpers.fmt('/api/v2/users/%@.json', user_id),
					type: 'PUT',
					contentType: 'application/json',
					data: JSON.stringify({
						user:{
							user_fields: {
								to_do_list_field: json_string
							}
						}
					})
				};
			}
		},

		events: {
			'app.activated':'init',
			'updateFieldData.done': 'getFieldData',
			'click .note_btn': 'toggleNotes',
			'click #add_task': 'loadNewTask',
			'click #submit_new_task': 'collectTaskData',
			'click #cancel_new_task': 'loadAppView',
			'click .delete_btn': 'deleteTask'
		},

		init: function() {
				this.getFieldData();
		},

		getFieldData: function() {
			var user_id = this.currentUser().id();
			this.ajax('getFieldData', user_id)
			.done(function(data){
				var app_name = data.user.name + "\'s To-do list";
				this.$('.app_title').text(app_name);
				if (data.user.user_fields.to_do_list_field === null) {
					this.to_do_object = {"preferences": {"max_items": 5, "current_id": 2 }, "tasks": [{"id": 1, "title": "New Task", "description": "Some Description", "due_date": "February 14, 2015", "notes": "Some notes regarding this new task and stuff..."} ], "contexts": [{"id": 4, "name": "Work", "color": "#E31B1B"}, {"id": 5, "name": "Personal", "color": "#53D442"} ] };
					this.ajax('updateFieldData', user_id, JSON.stringify(this.to_do_object));
				}
				else {
					var object_string = data.user.user_fields.to_do_list_field;
					this.to_do_object = JSON.parse(object_string);
					this.loadAppView();
				}
			});
		},

		saveDataToField: function() {
			var object_string = JSON.stringify(this.to_do_object);
			var user_id = this.currentUser().id();
			this.ajax('updateFieldData', user_id, object_string);
		},

		loadAppView: function() {
			var num_tasks = this.to_do_object.tasks.length;
			var display_string = (num_tasks > 0) ? "" : "No tasks here. Click \"+ New Task\" to add one.";
			this.switchTo('app_index', {
				tasks: this.to_do_object.tasks,
				string_data: display_string
			});
		},

		toggleNotes: function(event) {
			event.preventDefault();
			console.log(event);
			var ct = event.currentTarget;
			var note_span = event.currentTarget.nextElementSibling;
			this.$(note_span).toggle();
		},

		loadNewTask: function() {
			this.switchTo('new_task');
			this.$("#new_task_id").val(this.to_do_object.preferences.current_id);
			this.$("#new_task_due_date").datepicker();
		},

		createNewTask: function(task_object) {
			var to_do_object = this.to_do_object;
			to_do_object.tasks.push(task_object);
			to_do_object.preferences.current_id++;
			this.saveDataToField();
			this.loadAppView();
		},

		deleteTask: function(e) {
			e.preventDefault();
			var task_id = parseInt(e.currentTarget.dataset.taskId, 10);
			var to_do_object = this.to_do_object;
			var new_tasks = _.filter(this.to_do_object.tasks, function(t){
				return t.id !== task_id;
			});
			this.to_do_object.tasks = new_tasks;
			this.saveDataToField();
			this.loadAppView();
		},

		collectTaskData: function() {
			var task = {};
			var task_id = this.$("#new_task_id").val();
			task.id = parseInt(task_id, 10);
			task.title = this.$("#new_task_title").val();
			task.description = this.$("#new_task_description").val();
			task.due_date = this.$("#new_task_due_date").val();
			task.notes = this.$("#new_task_notes").val();
			this.createNewTask(task);
		}
	};

}());
