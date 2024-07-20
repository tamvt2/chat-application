let actionType;
const imageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const videoTypes = ['video/mp4'];
const audioTypes = ['audio/mpeg'];
const documentTypes = [
	'application/msword',
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

$(document).ready(function () {
	const isLoggedIn = $('.img-profile').data('id');
	if (isLoggedIn) {
		loadChannels();
		setInterval(loadChannels, 20000);
	}

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

	socket.on('new-message', (message) => {
		loadChannels();
	});

	function sendMessage() {
		const content = $('.send').val().trim();
		const userId = $('.list-user').data('id');
		console.log($('.send').val());
		const channel_id = $('.send').data('channel-id');
		socket.emit('message', {
			content: content,
			channel_id: channel_id,
		});

		$.ajax({
			url: '/send-message',
			type: 'POST',
			data: { content, channel_id, userId },
			dataType: 'json',
			success: function (results) {
				$('.send').val('');
				getMessage(channel_id);
			},
		});
	}

	$('.destroy').on('click', (e) => {
		e.preventDefault();
		const channel_id = $('.destroy').data('id');
		$.ajax({
			processData: false,
			contentType: false,
			url: '/destroy-message/' + channel_id,
			type: 'DELETE',
			data: { channel_id },
			dataType: 'json',
			success: function (data) {
				if (data.success) {
					location.reload();
				}
			},
		});
	});

	$('.upload-file').on('click', (e) => {
		e.preventDefault();
		$('#upload-file').click();
	});

	$('#upload-file').on('change', (event) => {
		const channel_id = $('.send').data('channel-id');
		const content = $('.send').val().trim();
		const input = event.target;
		const formData = new FormData();
		const files = input.files;

		const maxSize = 100 * 1024 * 1024;

		if (files.length > 10) {
			alert('Chỉ có thể tải lên 10 tệp 1 lúc');
			return;
		}

		// Kiểm tra kích thước tệp
		for (let i = 0; i < files.length; i++) {
			if (files[i].size > maxSize) {
				alert('Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 100MB.');
				// Xóa tệp đã chọn
				input.value = '';
				return;
			}
		}

		if (files.length > 0) {
			for (let i = 0; i < files.length; i++) {
				formData.append('files', files[i]);
			}
			formData.append('channel_id', channel_id);
			formData.append('content', content);

			$.ajax({
				url: '/upload-file',
				type: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function (results) {
					$('.send').val('');
					if (results.success) {
						getMessage(channel_id);
					} else {
						alert(results.message);
					}
				},
			});
		}
	});
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
					$('.list-user').attr('data-id', data[0].id);
				} else {
					$('.list-user').html(`
						<img src="${data[0].image_url}" alt="" class="ml-4 rounded-circle">
						<div class="ml-3">
							<h5>${data[0].name}</h5>
							<span><i class="fas fa-circle"></i> ${data[0].status}</span>
						</div>
					`);
					$('.list-user').attr('data-id', data[0].id);
				}
				getMessage(channel_id);
				$('.content').show('block');

				loadChannels();
			} else {
				$('.send').attr('data-channel-id', channel_id);
				$('.list-user').html(
					`<a href="#" data-toggle="modal" data-target="#list-user">Danh sách thành viên</a>`
				);
				$('.list-user').attr('data-id', data[0].id);
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
				getMessage(channel_id);
				$('.content').show('block');

				loadChannels();
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
			if (data.results) {
				$('.add-friend').attr('data-channel-id', channel_id);
				$('.chat-body').empty();
				data.results.forEach((val) => {
					if (val.user_id == id) {
						if (imageTypes.includes(val.mimetype)) {
							return $('.chat-body').append(`
								<div class="chat-message sent">
									<div class="message-content">
										<!-- Tin nhắn là video -->
										<p class="message-text">${val.content}</p>
										<a href="${val.file_path}" target="_blank">
											<img src="${val.file_path}" class="message-image" alt="image">
										</a>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
								</div>
							`);
						} else if (videoTypes.includes(val.mimetype)) {
							return $('.chat-body').append(`
								<div class="chat-message sent">
									<div class="message-content">
										<p class="message-text">${val.content}</p>
										<a href="${val.file_path}">
											<video controls class="message-video">
												<source src="${val.file_path}" type="video/mp4">
												Your browser does not support the video tag.
											</video>
										</a>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
								</div>
							`);
						} else if (audioTypes.includes(val.mimetype)) {
							return $('.chat-body').append(`
								<div class="chat-message sent">
									<div class="message-content">
										<p class="message-text">${val.content}</p>
										<p class="file-name">
											<audio controls>
												<source src="${val.file_path}" type="audio/mp3">
											</audio>
										</p>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
								</div>
							`);
						} else if (documentTypes.includes(val.mimetype)) {
							return $('.chat-body').append(`
								<div class="chat-message sent">
									<div class="message-content">
										<p class="message-text">${val.content}</p>
										<a href="${val.file_path}" class="file-name text-gray-600">${val.file_path}</a>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
								</div>
							`);
						} else {
							return $('.chat-body').append(`
								<div class="chat-message sent">
									<div class="message-content">
										<p class="message-text">${val.content}</p>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
								</div>
							`);
						}
					} else {
						if (imageTypes.includes(val.mimetype)) {
							return $('.chat-body').append(`
								<div class="chat-message received">
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
									<div class="message-content">
										<!-- Tin nhắn là video -->
										<p class="message-text">${val.content}</p>
										<a href="${val.file_path}" target="_blank">
											<img src="${val.file_path}" class="message-image" alt="image">
										</a>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
								</div>
							`);
						} else if (videoTypes.includes(val.mimetype)) {
							return $('.chat-body').append(`
								<div class="chat-message received">
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
									<div class="message-content">
										<p class="message-text">${val.content}</p>
										<a href="${val.file_path}">
											<video controls class="message-video">
												<source src="${val.file_path}" type="video/mp4">
												Your browser does not support the video tag.
											</video>
										</a>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
								</div>
							`);
						} else if (audioTypes.includes(val.mimetype)) {
							return $('.chat-body').append(`
								<div class="chat-message received">
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
									<div class="message-content">
										<p class="message-text">${val.content}</p>
										<p class="file-name">
											<audio controls>
												<source src="${val.file_path}" type="audio/mp3">
											</audio>
										</p>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
								</div>
							`);
						} else if (documentTypes.includes(val.mimetype)) {
							return $('.chat-body').append(`
								<div class="chat-message received">
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
									<div class="message-content">
										<p class="message-text">${val.content}</p>
										<a href="${val.file_path}" class="file-name text-gray-600">${val.file_path}</a>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
								</div>
							`);
						} else {
							return $('.chat-body').append(`
								<div class="chat-message received">
									<img src="${val.image_url}" class="message-avatar rounded-circle" alt="avatar">
									<div class="message-content">
										<p class="message-text">${val.content}</p>
										<span class="message-time">${formatDate(val.created_at)}</span>
									</div>
								</div>
							`);
						}
					}
				});
				scrollToBottom();
				getImage(channel_id);
				getFile(channel_id);
			}
		},
	});
}

function loadChannels() {
	$.ajax({
		url: '/get-channels',
		type: 'GET',
		dataType: 'json',
		success: function (results) {
			$('.row').empty();
			if (results.length > 0) {
				results.map((val) => {
					const itemHTML = `
						<div class="item d-flex mt-3" onclick="showChat(${val.channel_id})">
							<img src="${val.image_url}" class="rounded-3" alt="">
							<div class="ml-2 d-flex flex-column justify-content-between flex-grow-1">
								<div class="d-flex justify-content-between">
									<h5 class="mb-0">${val.name}</h5>
									<span class="mb-0">${formatTimeElapsed(val.created_at)}</span>
								</div>
								<div class="d-flex justify-content-between">
									<p class="mb-0 message"></p>
									<a href="" id="dropdown" data-bs-toggle="dropdown" class="pl-1 pr-1 text-gray-600">
										<i class="fas fa-ellipsis-h"></i>
									</a>
									<ul class="dropdown-menu" aria-labelledby="dropdown">
										<li><a class="dropdown-item" href="#" data-toggle="modal" data-target="#rename">
											Đổi tên hội thoại
										</a></li>
										<li><a class="dropdown-item destroy" href="" data-id="${val.channel_id}">
											Xóa hội thoại
										</a></li>
									</ul>
								</div>
							</div>
						</div>
					`;
					const $item = $(itemHTML);
					$item
						.find('p.message')
						.html(
							val.is_read
								? val.content
								: `<strong>${val.content}</strong>`
						);
					$('.row').append($item);
				});
			}
		},
	});
}

function getImage(channel_id) {
	$.ajax({
		url: '/get-image',
		type: 'GET',
		data: { channel_id },
		dataType: 'json',
		success: function (data) {
			$('.list-image').empty();
			if (data.success) {
				data.results.map((val) => {
					if (imageTypes.includes(val.mimetype)) {
						$('.list-image').append(`
							<a href="${val.file_path}">
								<img src="${val.file_path}">
							</a>
						`);
					} else {
						$('.list-image').append(`
							<a href="${val.file_path}" target="_blank">
								<video controls>
									<source src="${val.file_path}" type="video/mp4">
								</video>
							</a>
						`);
					}
				});
			}
		},
	});
}

function getFile(channel_id) {
	$.ajax({
		url: '/get-file',
		type: 'GET',
		data: { channel_id },
		dataType: 'json',
		success: function (data) {
			$('.list-group').empty();
			if (data.success) {
				data.results.map((val) => {
					$('.list-group').append(`
						<li class="list-group-item">
							<a href="${val.file_path}" class="file-link">${val.file_path}</a>
							<span class="message-time">${formatDate(val.created_at)}</span>
						</li>
					`);
				});
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
			if (data.success) {
				$('.dismiss').click();
				loadChannels();
			}
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

function formatTimeElapsed(timestamp) {
	if (timestamp == '') {
		return '';
	}
	const now = new Date();
	const sentTime = new Date(timestamp);
	const timeDifferenceInHours = 7;
	sentTime.setHours(sentTime.getHours() + timeDifferenceInHours);
	const elapsed = now - sentTime; // Thời gian đã trôi qua tính bằng mili giây

	const seconds = Math.floor(elapsed / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (seconds < 60) {
		return `${seconds}s`;
	} else if (minutes < 60) {
		return `${minutes}m`;
	} else {
		return `${hours}h`;
	}
}
