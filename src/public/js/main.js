let actionType;

$(document).ready(function () {
	$('.profileImage').on('click', (e) => {
		$('#fileInput').click();
	});
	$('.content').hide();

	$('#profileForm').on('submit', (e) => {
		e.preventDefault();
		const phoneValue = $('#phone').val().trim();

		const formData = {
			phone: phoneValue,
			name: $('#name').val(),
			image_url: $('#thumb').val(),
		};

		if (isPhoneNumber(phoneValue)) {
			$('#errorAlert').removeClass('alert-danger');
		} else {
			$('#errorAlert').addClass('alert-danger');
			$('#errorAlert').removeClass('alert-success');
			$('#errorAlert')
				.text('Số điện thoại phải là dạng số. VD: 0123456789')
				.show();
			return;
		}

		$.ajax({
			url: '/update',
			type: 'POST',
			data: formData,
			dataType: 'json',
			success: function (data) {
				if (data.success) {
					$('#errorAlert').addClass('alert-success');
					$('#errorAlert').removeClass('alert-danger');
					$('#errorAlert').text(data.message).show();
				} else {
					$('#errorAlert').addClass('alert-danger');
					$('#errorAlert').removeClass('alert-success');
					$('#errorAlert').text(data.message).show();
				}
			},
			error: function (xhr, status, error) {
				alert('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
			},
		});
	});

	$('#search').on('submit', (e) => {
		e.preventDefault();
		const phone = $('#phoneSearch').val().trim();

		if (isPhoneNumber(phone)) {
			$('#errorAlert').removeClass('alert-danger');
		} else {
			$('#errorAlert').addClass('alert-danger');
			$('#errorAlert').removeClass('alert-success');
			$('#errorAlert')
				.text('Số điện thoại phải là dạng số. VD: 0123456789')
				.show();
			return;
		}

		$.ajax({
			url: '/searchUser',
			type: 'POST',
			data: { phone },
			dataType: 'json',
			success: function (data) {
				if (data.success) {
					$('#searchResult').html(`
						<div class="d-flex align-items-center justify-content-between mb-2">
							<div class="d-flex align-items-center">
								<img class="rounded-circle" src="${data.user[0].image_url}" alt="">
								<p class="ml-3 mb-0">Tên: ${data.user[0].name}</p>
							</div>
							<button class="addUserBtn btn btn-primary ml-auto" data-id="${data.user[0].id}" onclick="addUserBtn()">Thêm</button>
						</div>
					`);
				} else {
					$('#searchResult').html(`<p>${data.message}</p>`);
				}
			},
		});
	});

	$('#add-friend').on('show.bs.modal', function (event) {
		$('#searchResult').html('');
		$('#phoneSearch').val('');
		const button = $(event.relatedTarget);
		actionType = button.data('action');
	});

	$('.send').on('keydown', (e) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	});

	$('.btnSend').on('click', (e) => {
		e.preventDefault();
		sendMessage();
	});

	const socket = io();

	// Lắng nghe sự kiện 'message' từ WebSocket server
	socket.on('message', (message) => {
		const channel_id = $('.send').data('channel-id');
		getMessage(channel_id);
	});

	function sendMessage() {
		const content = $('.send').val().trim();
		const channel_id = $('.send').data('channel-id');
		socket.emit('message', {
			content: content,
			channel_id: channel_id,
		});

		$.ajax({
			url: '/send-message',
			type: 'POST',
			data: { content, channel_id },
			dataType: 'json',
			success: function (results) {
				$('.send').val('');
				getMessage(channel_id);
			},
		});
	}
});

function showChat(channel_id) {
	$.ajax({
		url: '/get-user',
		type: 'GET',
		data: { channel_id },
		dataType: 'json',
		success: function (data) {
			if (data.length === 1) {
				$('.send').attr('data-channel-id', channel_id);
				if (data[0].status === 'online') {
					$('.list-user').html(`
						<img src="${data[0].image_url}" alt="" class="ml-4 rounded-circle">
						<div class="ml-3">
							<h5>${data[0].name}</h5>
							<span><i class="fas fa-circle text-green"></i> ${data[0].status}</span>
						</div>
					`);
				} else {
					$('.list-user').html(`
						<img src="${data[0].image_url}" alt="" class="ml-4 rounded-circle">
						<div class="ml-3">
							<h5>${data[0].name}</h5>
							<span><i class="fas fa-circle"></i> ${data[0].status}</span>
						</div>
					`);
				}
				getMessage(channel_id);
				$('.content').show('block');
			} else {
				$('.send').attr('data-channel-id', channel_id);
				$('.list-user').html(
					`<a href="#" data-toggle="modal" data-target="#list-user">Danh sách thành viên</a>`
				);
				data.forEach((element) => {
					if (element.status === 'online') {
						$('.list').append(`
							<div class="d-flex mt-3">
								<img src="${element.image_url}" alt="" class="ml-4 rounded-circle">
								<div class="ml-3">
									<h5>${element.name}</h5>
									<span><i class="fas fa-circle text-green"></i> ${element.status}</span>
								</div>
							</div>
						`);
					} else {
						$('.list').append(`
							<div class="d-flex mt-3">
								<img src="${element.image_url}" alt="" class="ml-4 rounded-circle">
								<div class="ml-3">
									<h5>${element.name}</h5>
									<span><i class="fas fa-circle"></i> ${element.status}</span>
								</div>
							</div>
						`);
					}
				});
			}
		},
	});
}

function getMessage(channel_id) {
	const id = $('.img-profile').data('id');
	$.ajax({
		url: '/get-message',
		type: 'GET',
		data: { channel_id },
		dataType: 'json',
		success: function (data) {
			if (data) {
				$('.chat-body').empty();
				data.results.forEach((val) => {
					if (val.user_id == id) {
						$('.chat-body').append(`
							<div class="chat-message sent">
								<div class="message-content">
									<p class="message-text">${val.content}</p>
									<span class="message-time">${formatDate(val.created_at)}</span>
								</div>
								<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
							</div>
						`);
					} else {
						$('.chat-body').append(`
							<div class="chat-message received">
								<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
								<div class="message-content">
									<p class="message-text">${val.content}</p>
									<span class="message-time">${formatDate(val.created_at)}</span>
								</div>
							</div>
						`);
					}
				});
				scrollToBottom();
			}
		},
	});
}

function openMessage() {
	let windowWidth = $(window).width();
	if (windowWidth > 1250) {
		$('.content').css('width', `calc(${windowWidth} - 420px)`);
		$('.messages-panel').css('width', `350px`);
		$('.content').show();
		$('.messages-panel').show();
		$('.directory').hide();
	} else if (windowWidth <= 1250 && windowWidth > 960) {
		$('.content').css('width', `calc(${windowWidth} - 420px)`);
		$('.messages-panel').css('width', `350px`);
		$('.content').show();
		$('.messages-panel').show();
		$('.directory').hide();
	} else if (windowWidth <= 960 && windowWidth > 700) {
		$('.content').css('width', `calc(${windowWidth} - 420px)`);
		$('.messages-panel').css('width', `350px`);
		$('.content').show();
		$('.messages-panel').show();
		$('.directory').hide();
	} else if (windowWidth < 700) {
		$('.messages-panel').show();
		$('.content').hide();
		$('.directory').hide();
	}
}

function addUserBtn() {
	const id = $('.addUserBtn').data('id');
	if (actionType === 'addNewFriend') {
		addNewFriend(id);
	} else if (actionType === 'addFriend') {
		addFriend(id);
	}
}

function addNewFriend(id) {
	$.ajax({
		url: '/add-new-user',
		type: 'POST',
		data: { id },
		dataType: 'json',
		success: function (data) {
			console.log(data);
		},
	});
}

function addFriend(id) {
	const channel_id = $('.add-friend').data('channel-id');
	$.ajax({
		url: '/add-user',
		type: 'POST',
		data: { id, channel_id },
		dataType: 'json',
		success: function (data) {
			console.log(data);
		},
	});
}

function isPhoneNumber(input) {
	const phoneRegex = /^0[0-9]{9,10}$/;
	return phoneRegex.test(input);
}

function openFile() {
	let windowWidth = $(window).width();
	if (windowWidth > 1250) {
		if ($('.directory').is(':visible')) {
			$('.messages-panel').css('width', `350px`);
			$('.content').css('width', `calc(${windowWidth} - 420px)`);
			$('.directory').toggle('block');
		} else {
			$('.messages-panel').css('width', `350px`);
			$('.content').css('width', `calc(${windowWidth} - 755px)`);
			$('.directory').toggle('block');
		}
	} else if (windowWidth <= 1250 && windowWidth > 960) {
		if ($('.directory').is(':visible')) {
			$('.messages-panel').css('width', `350px`);
			$('.content').css('width', `calc(${windowWidth} - 420px)`);
			$('.messages-panel').toggle('block');
			$('.directory').toggle('block');
		} else {
			$('.messages-panel').css('width', `350px`);
			$('.content').css('width', `calc(${windowWidth} - 420px)`);
			$('.messages-panel').toggle('block');
			$('.directory').toggle('block');
		}
	} else if (windowWidth <= 960 && windowWidth > 700) {
		if ($('.directory').is(':visible')) {
			$('.content').css('width', `calc(${windowWidth} - 420px)`);
			$('.directory').toggle('block');
		} else {
			$('.messages-panel').css('width', `350px`);
			$('.content').css('width', `calc(${windowWidth} - 420px)`);
			$('.directory').toggle('block');
		}
	} else if (windowWidth < 700) {
		$('.messages-panel').css('width', `350px`);
		$('.content').toggle('block');
		$('.directory').toggle('block');
		$('#btnFile').toggle('block');
	}
}

function cloneFile() {
	$('.directory').toggle('block');
	$('.content').toggle('block');
	$('#btnFile').toggle('block');
}

$('#fileInput').change(function () {
	const formData = new FormData();
	formData.append('image', this.files[0]);

	$.ajax({
		url: '/upload-image',
		type: 'POST',
		data: formData,
		processData: false,
		contentType: false,
		success: function (results) {
			if (results.success) {
				$('.profileImage img').attr('src', results.imageUrl);
				$('#thumb').val(results.imageUrl);
			} else {
				alert(results.message);
			}
		},
	});
});

function formatDate(date) {
	return moment(date).add(7, 'hours').format('HH:mm:ss DD/MM/YYYY');
}

function scrollToBottom() {
	var chatBox = $('.chat-body');
	var scrollHeight = chatBox.prop('scrollHeight');
	chatBox.scrollTop(scrollHeight);
}
