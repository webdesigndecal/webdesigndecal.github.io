
// TODO: Extend base with the following script

$(function () {

	// Shortest (result satisfying the shortest list) zip (not literally the shortest/quickest code)
	function zip(lists) {

		var shortest = lists.map(function (list) {
			return list.length;
		}).reduce(function (a, b) {
			return Math.min(a, b);
		});

		var result = [];
		for (var i = 0; i < shortest; ++i) {
			result.push(lists.map(function (list) {
				return list[i];
			}));
		}

		return result;

	}

	zip([
		document.querySelectorAll('.tab-nav-item'),
		document.querySelectorAll('.tab-section')
	]).map(function (pair, i) {
		var $navItem = $(pair[0]), $tabSection = $(pair[1]);

		function clickHandler() {
			// Non-binding-required

			// Focus current nav item
			$navItem.siblings('.tab-nav-item').removeClass('tab-nav-item-active');
			$navItem.addClass('tab-nav-item-active');

			// Focus on current tab section
			$tabSection.siblings('.tab-section').hide();
			$tabSection.show();
		}

		$navItem.click(clickHandler);

		if (i === 0) {
			clickHandler();
		}

	});

});

// queue.js

$(function () {

	var $unresolvedQueue = $('.queue.unresolved'),
	    $resolvedQueue = $('.queue.resolved');
	var $tabLastUpdated = $('.tab-last-updated');
	var questionTemplate = document.getElementById('template-queue-question');
	var questionVoteTemplate = document.getElementById('template-queue-question-vote');

	var mostRecentModified = undefined;

	var questionSet = {};

	function updateQuestionDOM(question) {

		// Requires question.id and
		// question.{resolved,question} if question.active (when calling on a specific question a first time when filling in displayed values)

		var elementId = 'question-' + question.id;
		var element;

		if (question.id in questionSet) {
			element = document.getElementById(elementId);
		} else {
			questionSet[question.id] = {};
		}

		var questionProps = questionSet[question.id];

		// Inactivity signal?

		if ('active' in question && question.active === false) {

			if (element) {
				// Remove inactive element
				element.parentNode.removeChild(element);
			}

			return; // Do not update DOM!
		}

		// DOM needs updating
		// Since the question is active, resolved & question params should be available if first time

		var $queue = 'resolved' in question
			? (question.resolved ? $resolvedQueue : $unresolvedQueue)
			: $(element.parentNode);

		if (!element) {
			// New element

			var fragment = document.importNode(questionTemplate.content, true);
			element = fragment.querySelector('.question');

			element.id = elementId;

			element.style.order = question.id; // Automatic element sorting from flex context

			var $rowCaption = $('.row-caption', element),
			    $rowDescription = $('.row-question', element),
			    $rowAnswer = $('.row-answer', element),
			    $rowEdit = $('.row-edit', element),
			    $rowEditAnswer = $('.row-edit-answer', element),
			    $rowResolve = $('.row-resolve', element),
			    $rowUnresolve = $('.row-unresolve', element),
			    $rowRemove = $('.row-remove', element),
			    $rowUpvote = $('.row-upvote', element);

			$rowCaption.text(
				'#' + question.id +
				('name' in question ? ' | ' + question.name : '')
			);

			// Editable only appears at the time of fetching the questions initially
			if ('editable' in question && question.editable === true) {
				// Question editable

				$rowEdit.click(function () {
					$rowDescription.attr('contenteditable', 'true');
					$(this).hide();
				});

				$rowDescription.on('keydown', function(event){
					if (event.keyCode === 13) {
						event.preventDefault();

						var $this = $(this);

						updateQuestion(question.id, {
							question: $this.text()
						})
							.success(function (question) {
								$rowEdit.show();
								$this.attr('contenteditable', 'false');
							})
							.error(function () {
								// Display error

							});
					}
				});

				$rowResolve.click(function () {
					var $this = $(this);
					$this.hide();

					updateQuestion(question.id, {resolved: true})
						.success(function (data) {
							if ('error' in data) {
								$this.show();

								failure_notification(data.error);
								return;
							}

							// Fake a web API JSON response to unresolve the question, with only the necessary parameters to update DOM
							updateQuestionDOM({
								id: question.id,

								resolved: true,
							});
						})
						.error(function () {
							// Display error
							$this.show();

							failure_notification('Something went wrong while resolving the question');
						});
				});

				$rowUnresolve.click(function () {
					var $this = $(this);
					$this.hide();

					updateQuestion(question.id, {resolved: false})
						.success(function (data) {
							if ('error' in data) {
								$this.show();

								failure_notification(data.error);
								return;
							}

							// Fake a web API JSON response to unresolve the question, with only the necessary parameters to update DOM
							updateQuestionDOM({
								id: question.id,

								resolved: false,
							});
						})
						.error(function () {
							// Display error
							$this.show();

							failure_notification('Something went wrong while reverting resolving the question');
						});
				});

				$rowRemove.click(function () {
					var $this = $(this);
					$this.hide();

					updateQuestion(question.id, {active: false})
						.success(function (data) {
							if ('error' in data) {
								$this.show();

								failure_notification(data.error);
								return;
							}

							// Fake a web API JSON response to unresolve the question, with only the necessary parameters to update DOM
							updateQuestionDOM({
								id: question.id,

								active: false,
							});
						})
						.error(function () {
							// Display error
							$this.show();

							failure_notification('Something went wrong while removing the question');
						});
				});

			} else {
				// Question not editable
				$rowEdit.remove();
				$rowResolve.remove();
				$rowUnresolve.remove();
				$rowRemove.remove();
			}

			// This part is a little overloaded, but it is here to identify instructors
			if ('votes' in question && 'detail' in question.votes && question.votes.detail === 'LAZY...') {

				$rowEditAnswer.click(function () {
					$rowAnswer.attr('contenteditable', 'true');
					$(this).hide();

					// Show the horizontal divider
					$('.row-question-answer-divider', element).show();
				});

				$rowAnswer.on('keydown', function(event){
					if (event.keyCode === 13) {
						event.preventDefault();

						var $this = $(this);

						updateQuestion(question.id, {
							answer: $this.text()
						})
							.success(function (question) {
								$rowEditAnswer.show();
								$this.attr('contenteditable', 'false');
							})
							.error(function () {
								// Display error

							});
					}
				});

            } else {

                $rowEditAnswer.remove();

            }

			// Editable or not...
			// User needs authenticating before upvoting
			if (USERNAME) {

				$rowUpvote.click(function () {
					var $this = $(this);

					voteQuestion(question.id, 1)
						.success(function (data) {
							if ('error' in data) {
								// Display error
								failure_notification(data.error);
								return;
							}

							updateQuestionDOM({
								id: question.id,

								votes: data,
							});
						})
						.error(function () {
							// Display error
							failure_notification('Something went wrong while upvoting the question');
						});
				});

			} else {
				// Cannot vote!
				$rowUpvote.remove();
			}

			$queue[0].appendChild(fragment);

		} else {
			// Otherwise existing element

			// Need to check if the DOM element is under the correct parent
			if (element.parentNode !== $queue[0]) {
				// Parent node needs updating

				$queue.append(element); // Re-appending an element under the new parent node seems to work

			}

		}

		// Updating the question in the DOM could overwrite the text if currently being edited by the user
		if ('question' in question) {
			$('.row-question', element).text(question.question);
		}

		if ('answer' in question) {
			$('.row-answer', element).text(question.answer);
		}
		// Show/hide the horizontal divider
		$('.row-question-answer-divider', element).toggle(!!$('.row-answer', element).text());

		// Updating the buttons' visibility could cause the button to show up in the middle of posting the state change of the question through AJAX
		if ('resolved' in question) {
			if (question.resolved) {
				$('.row-resolve', element).hide();
				$('.row-unresolve', element).show();
			} else {
				$('.row-resolve', element).show();
				$('.row-unresolve', element).hide();
			}
		}

		if ('votes' in question) {

			// Check if the num votes received invalidates the cached value...
			// To save some work from fetching the latest list of votes
			if (question.votes.count !== questionProps.votes) {
				questionProps.votes = question.votes.count;

				// Fake an API response to have a rough look updated :(
				handleQuestionVotes(question.id, {
					'count': question.votes.count
				});

				if ('detail' in question.votes) {
					getQuestionVotes(question.id)
					.success(function (data) {

						// Here comes the actual API response to give a detailed look
						handleQuestionVotes(question.id, data);

					})
					.error(function () {
						// Display error
							failure_notification('Something went wrong while getting the latest upvotes');
					});
				}
			}

		}

	}

	function updateQuestionVoteDOM(questionElement, vote) {

		// Requires vote.{count,user_id}

		var elementId = questionElement.id + '-vote-' + vote.user_id;

		var element = document.getElementById(elementId);

		if (!element) {
			// New element

			var fragment = document.importNode(questionVoteTemplate.content, true);

			element = fragment.querySelector('.vote');

			element.id = elementId;

			$('.row-votes', questionElement)[0].appendChild(fragment);

		}

		element.style.order = - vote.count;

        var $count = $('.count', element);
        if (vote.count > 1) {
            $count.css('opacity', 1).text(vote.count);
        } else {
            $count.css('opacity', 0);
        }

		if ('user_picture' in vote) {
			$('.pic img', element).attr('src', vote.user_picture);
		}

        if ('user_name' in vote) {
            $('.pic img', element).attr('title', vote.user_name);
        }

	}

	function handleQuestions(data) {
		if ('error' in data) {
			failure_notification(data.error);
			return;
		}

		data.forEach(function (question) {

			// Requires question.modified and extends the requirements from ``updateQuestionDOM()``

			if (question.modified > mostRecentModified || mostRecentModified === undefined) {
				mostRecentModified = question.modified;
			}

			updateQuestionDOM(question);

		});

	}

	function handleQuestionVotes(questionId, data) {
		if ('error' in data) {
			// Display error
				failure_notification(data.error);
				return;
		}

		var element = document.getElementById('question-' + questionId);

        var $rowUpvote = $('.row-upvote', element);
        if (data.voted) {
            $rowUpvote.text('Upvoted! (' + data.count + ')');
        } else {
            $rowUpvote.text('Upvote (' + data.count + ')');
        }

		if ('detail' in data) {

			data.detail.forEach(function (vote) {

				updateQuestionVoteDOM(element, vote);

			});

		}

	}

	function postQuestion(str) {

		if (!LECTURE_ID) {
			return {
				success: function (func) {
					func({
						error: 'Lecture is not specified',
					});

					return this;
				},
				error: function () {
					return this;
				},
			};
		} else if (!(typeof str === 'string' || (typeof str !== 'object' && str instanceof String))) {
			// Fake a jQuery deferred object as AJAX response if not a string
			return {
				success: function (func) {
					func({
						error: 'Something\'s wrong with the data type of the question',
					});

					return this;
				},
				error: function () {
					return this;
				},
			};
		} else if (str.trim() === '') {
			// Fake a jQuery deferred object as AJAX response if empty
			return {
				success: function (func) {
					func({
						error: 'The question\'s empty',
					});

					return this;
				},
				error: function () {
					return this;
				},
			};
		}

		return $.ajax({
			url: '/queue/lectures/' + LECTURE_ID + '/questions/',
			type: 'post',
			dataType: 'json',
			data: {
				question: str,
				csrfmiddlewaretoken: TOKEN,
			},
		});

	}

	function updateQuestion(id, question) {

		var data = $.extend({
			csrfmiddlewaretoken: TOKEN,
		}, question);

		return $.ajax({
			url: '/queue/questions/' + id + '/',
			type: 'post', // Acting like a partial put for now :|
			dataType: 'json',
			data: data,
		});

	}

	function getQuestionVotes(id) {

		return $.ajax({
			url: '/queue/questions/' + id + '/votes/',
			type: 'get',
			dataType: 'json',
		});

	}

	function voteQuestion(id, incrementCount) {

		return $.ajax({
			url: '/queue/questions/' + id + '/votes/',
			type: 'post', // Hella weird API method scheme right now :(
			dataType: 'json',
			data: {
				increment_count: incrementCount,
				csrfmiddlewaretoken: TOKEN,
			},
		});

	}

	// Refresh list of questions

	function refreshQuestions() {

		if (!LECTURE_ID) {
			failure_notification('Lecture is not specified');
			return;
		}

		$.ajax({
			url: '/queue/lectures/' + LECTURE_ID + '/questions/',
			type: 'get',
			dataType: 'json',
			data: {
				modified__gt: mostRecentModified,
			},
		})
			.success(function (data) {
				handleQuestions(data);

				$tabLastUpdated.html(
					'Last updated: ' + new Date().toLocaleString() + '<br>' +
					'Showing lecture: ' + LECTURE_ID
				);

				setTimeout(refreshQuestions, 5000);
			})
			.error(function () {

				failure_notification('Error receiving page updates :(<br>Refresh the page to try again');

			});

	}

	// Initial fetch of questions
	if (LECTURE_ID) refreshQuestions();

	// Handle new question submissions
	// Element is only selectable if user is authenticated

	$('#new-question').on('keydown', function (event) {
		if (event.keyCode === 13) {
			event.preventDefault();

			var $this = $(this);
			$this.attr('contenteditable', 'false');

			var question = $this.text();

			postQuestion(question)
				.success(function (data) {
					// Successfully receive response
					$this.attr('contenteditable', 'true');

					if ('error' in data) {
						// Failed to post question
						failure_notification(data.error);
						return;
					}

					// Question posted

					$this.text(''); // Clear the text box

					// Fake a web API initial JSON response (including info about editability),
					// with only the necessary parameters to update DOM
					// More visual things will be updated when the question is sync a next loop
					updateQuestionDOM({
						id: data.id,

						resolved: false,
						question: question,

						editable: true,

						name: data.name,
					});

					success_notification('Your question\'s posted')
				})
				.error(function () {
					// Display error
					$this.attr('contenteditable', 'true');

					failure_notification('Something went wrong while posting the question');
				});
		}
	});

});
