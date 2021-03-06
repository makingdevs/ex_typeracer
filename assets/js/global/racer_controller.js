import socket from "./socket"
import HandlebarsResolver from "./handlebars_resolver"
import { MatchController } from "./match_controller";
import "sprite-js"
import "./sprite"
import "bootstrap-notify"
import "jquery-validation"

export var RacerController = {
  uuid: Math.floor((Math.random() * 10000) + 1),
  channelScore: null,
  channelRoom: null,
  processRoom: null,
  username:null,
  name_room: null,
  uuid_game: null,
  colors_bar: {
    0: "black-bar",
    1: "green-bar",
    2: "blue-bar",
    3: "yellow-bar",
    4: "red-bar",
    5: "orange-bar",
    6: "brown-bar"
  },

  initChannelRoom: function () {
    $("#container_timer_waiting").hide()
    this.channelRoom = socket.channel("room:new", {})
    let that = this
    this.channelRoom.join()
			.receive("ok", resp => {
        console.log("Room successfully 😎", resp)
        this.channelRoom.push("get_romms")
			})
      .receive("error", resp => { console.log("Unable to join", resp) })
	  this.channelRoom.on("list_rooms", msg => {
				$("#list_roms").html("")
					$.each(msg.rooms, function( index, value ) {
            console.log(value)
            $("#list_roms").append(`<tr class="pointer room_ref"><td name="room">${value}</td></tr> `)
					});
			});
  },
  knowExistUsername: function (username) {
    this.channelRoom.push("exist_username", username)
      .receive('ok', resp => { console.log(resp)
        if (resp.existed){
          $("#validUsername").addClass("is-invalid")
        }
        else {
          $("#validUsername").removeClass("is-invalid")
        }
      })
  },

  knowExistEmail: function (email) {
    let hasExisted = false
    this.channelRoom.push("exist_email", email)
      .receive('ok', resp => { console.log(resp)
        if (resp.existed){
          $("#validEmail").addClass("is-invalid")
          hasExisted = true;
        }
        else {
          $("#validEmail").removeClass("is-invalid")
        }
      })
      return hasExisted
  },
  listnenKeyBoeard: function(){
    let that = this
    $("#validUsername").on("keyup", (e) => {
      let username = $("#validUsername").val()
      that.knowExistUsername(username)
      if(e.originalEvent.keyCode == 32){
        username = username.replace(/\s/g, '');
        $("#validUsername").val(username)
      }
    });
    $("#validEmail").on("keyup", () => {
      let email = $("#validEmail").val()
      that.knowExistEmail(email)
    })
  },
  initChannelTimer: function(name_room, uuid_game) {
    let that = this
    console.log(uuid_game);
    var channel = socket.channel("timer:update", {})
      channel.join()
      .receive("ok", resp => { console.log("Timer Channel Joined 😉", resp) })
      .receive("error", resp => { console.log("No se puede conectar al Timer Channel", resp) })

      channel.on(`new_time_${uuid_game}`, msg => {
          document.getElementById('status').innerHTML = msg.response
          document.getElementById('timer').innerHTML = msg.time
          console.log("Se lanza")

          $("#start-timer").hide()
          if (msg.time === 0){
            $("#start-timer").show()
            that.showRunArea(name_room)
            $("#timer_run_area").hide();
            that.channelRoom.push("show_run_area", name_room)
            //that.animattionSprite()
          }
      });

      channel.on(`waiting_time_${uuid_game}`, msg => {
        $("#container_timer_waiting").show()
        $("#timer_waiting").text(msg.time)
        if(msg.time == 0){
          $("#start-timer").trigger("click")
        }
      });

      channel.on(`playing_time_${uuid_game}`, msg => {
        $("#container_timer_waiting").hide()
        $("#container_timer_playing").show()
        $("#timer_playing").text(msg.time)
        if(msg.time == 0){
          $('#modalWiner').modal('show');
          console.log(msg.positions)
          console.log("Juego terminado")
          $("#name_winer").text(msg.positions[0])
        }
      });

      $("#timer_run_area").on("click", "#start-timer" , () =>{
        console.log(`Este es id ${uuid_game}`)
      channel
      .push('start_timer', {name_room})
      .receive('ok', resp => { console.log("Starter timer",resp) })
    })
  },

  showRunArea: function(nameRom) {
    this.channelRoom.on(`${nameRom}`, msg => {
      console.log(msg)
      HandlebarsResolver.constructor.mergeViewWithModel("#run_area", msg, "container-run-area")
      MatchController.validateKeyWord(msg.data)
    })

  },

  initChannelPlayers: function () {
    let channelPlayer = socket.channel("players", {uuid: this.uuid})
    let that = this

//			channelPlayer.on("players_list", msg => {
//				$("#list_users").html("")
//					$.each(msg.users, function( index, value ) {
//            if (value == that.uuid)
//              $("#list_users").append(`<p><strong> You </strong> Score: %<span id='${value}'>0</span></p> `)
//            else
//              $("#list_users").append(`<p><strong> Guess </strong> Score: %<span id='${value}'>0</span></p> `)
//					});
//			});

			channelPlayer.join()
				.receive("ok", resp => {
					console.log("Player successfully 😎", resp)
				})
				.receive("error", resp => { console.log("Unable to join", resp) })

			channelPlayer.push('get_list', {})
  },

  initChannelScores: function () {
    let that = this
    this.channelScore = socket.channel("scores", {})
			//Join al Channel de Scores
      this.channelScore.join()
      .receive("ok", resp => { console.log("Scores Channel Joined 😙 ", resp) })
      .receive("error", resp => { console.log("No se puede conectar al Scores Channel", resp) })
//      this.channelScore
//      .push('scores:get', { user: this.uuid })
//      .receive('ok', resp => { console.log("ok",resp) })
			// Socket donde llegarán todos los scores
			this.channelScore.on("scores:show", msg => {
        msg.game.forEach((element, index) => {
          console.log(element)
          $(`#${element.username}`).text(element.score)
          let score = (element.score) * 1 // Porcent of div in case of be more little
          console.log("Lo que buscas")
          console.log(element)
          $(`#${element.username}-sprite`).css("margin-left", `${score}%`)
          $(`#${element.username}-bar`).css("width", `${score}%`)
          console.log($(`#${that.username}-bar`))
        });
      });

      this.channelScore.on("socore:winer_show", msg => {
        console.log(msg);
        if(msg.uuid_game == that.uuid_game){
          console.log("Estas aquí...");
          HandlebarsResolver.constructor.mergeViewWithModel("#positions_to_player", msg, "list_positions_container")
        }
      });
  },
  initRom: function(){
    let that = this
    $("#start-room").on("click", () =>{
      $("#list_roms_container").hide()
      console.log("click")
      $("#link_to_shared").show()
      that.uuid = $("#recipient_name").val()
      that.name_room = $("#name_room_txt").val()
      console.log(that.name_room)
      console.log(that.uuid)
      this.channelRoom
      .push('init_reace', {username: that.uuid, name_room: that.name_room})
      .receive('ok', response =>{
        console.log("ok", response)
        that.processRoom = response.process;
        that.uuid = response.process
        that.username = response.user
        that.uuid_game = response.uuid
        that.updatingPlayers(that.name_room)
        that.initChannelTimer(that.name_room, that.uuid_game)
        HandlebarsResolver.constructor.mergeViewWithModel("#timer_area", response, "timer_run_area")
        HandlebarsResolver.constructor.mergeViewWithModel("#list_users_players", response, "list_user_area")
        $("#container-header-player").hide()
      })
    })
  },
  removeCurrentPlayer: function(playersList){
    let currentPlayer
    let that = this
    playersList.forEach(function(val,index) {
      if(val.username == that.username){
        currentPlayer = val
     }
   })
   let index = playersList.indexOf(currentPlayer)
   playersList.splice(index, 1)
   playersList.unshift(currentPlayer)
  },
  updatingPlayers: function (name_room) {
    let that = this
    console.log(`Reinicia lista. ${name_room}`)
    this.channelRoom.on(`updating_player_${name_room}`, msg => {
      console.log(msg)
      let userList = msg.game.players;
      that.removeCurrentPlayer(userList)
      HandlebarsResolver.constructor.mergeViewWithModel("#list_users_players", { userList }, "list_user_area")
      that.assigmentColors()
    });
  },
  joinRom: function(){
    let that = this
    $("#join-room").on("click", () =>{
      that.username = $("#username_join").val()
      that.name_room = $("#game-id").val()
      that.callJoinActive(that.username, that.name_room)
    })
  },

  callJoinActive: function (username, name_room){
    let that = this
      this.channelRoom
      .push('join_race', {username: username, name_room: name_room})
      .receive('ok', response =>{
        console.log("ok", response)
        if(response.status === "waiting"){
          if(response.process == this.name_room){
            that.username = response.user
            that.processRoom = response.process;
            that.uuid_game = response.uuid;
            console.log(`Este es el game id: ${that.uuid_game}`)
            that.updatingPlayers(that.name_room)
            that.channelRoom.push("updating_players", that.name_room)
            that.initChannelTimer(that.name_room, that.uuid_game)
            HandlebarsResolver.constructor.mergeViewWithModel("#timer_area", response, "timer_run_area")
            HandlebarsResolver.constructor.mergeViewWithModel("#list_users_players", response, "list_user_area")
            $("#container-header-player").hide()
          }
        }
        else {
          console.log("La sala esta en juego o ya no")
          $.notify({
            // options
            message: 'La sala esta en juego o ya no está disponible'
          },{
            // settings
            type: 'danger'
          });
        }
      })
  },

  sendScore: function (score) {
    console.log(this.username);
    this.channelScore
      .push('scores:set', {user: this.username, score:score, name_rom: this.processRoom, tes:this.username})

  },
  sendPosition: function () {
    this.channelScore
      .push('scores:position', {username: this.username, name_room: this.processRoom})
  },

  animattionSprite: function () {
    console.log("Inicia animación")
    $(".scott").animateSprite({
      fps: 12,
      animations: {
          walkRight: [0, 1, 2, 3, 4, 5, 6, 7],
          walkLeft: [15, 14, 13, 12, 11, 10, 9, 8]
      },
      loop: true,
      complete: function(){
          // use complete only when you set animations with 'loop: false'
          alert("animation End");
      }
  });
  },

  scenePlayer: function() {
    var image = new Image()
    image.src = '/images/pan.png'
    console.log(image)
    var sprite = new Sprite({
      canvas: document.getElementById('canvas'),
      image: image,
      rows: 4,
      columns: 3,
      columnFrequency: 1
    });
  },

  validateFormRegister: function (){
    let that = this
    $("#submit_button_register").on("click", () => {
      console.log("hgh")
      let email = $("#validEmail").val()
      let username = $("#validUsername").val()
      if ( !$(".invalid-feedback").is(":visible") ){
        $("#register_form").submit()
      }
    })
  },

  listenFromListRooms: function(){
    let that = this
    $("#list_roms").on("click", ".room_ref" ,(e) => {
      console.log($(e.currentTarget).text())
      that.username = $("#username_join").val()
      if(!that.username){
        that.username = `Guess${Math.floor((Math.random() * 100) + 1)}`
      }
      that.name_room = $(e.currentTarget).children("td[name='room']").text()
      $("#link_to_shared").show()
      that.callJoinActive( that.username, that.name_room)
    });
  },

  joinGameFromUrl(){
    let that = this
    that.name_room = $("#url_url").val()
    that.username = $("#username_join").val()
    if (that.name_room){
      console.log("Viene desde url")
      console.log(that.name_room)
      if(!that.username){
        that.username = `Guess${Math.floor((Math.random() * 100) + 1)}`
      }
      that.callJoinActive( that.username, that.name_room)
      $("#playing_now").on("click", () => {
        that.callJoinActive( that.username, that.name_room)
      });
    }
  },
  showingPass: function() {
    $("#icon_showing_pass").on("mousedown", ()=> {
      $("#registerPass").prop("type", "text")
    })
    $("#icon_showing_pass").on("mouseup", ()=> {
      $("#registerPass").prop("type", "password")
    })
  },
  validateNamesRoom: function() {
    $(".valid_word").on("keyup", (e) =>{
      let name_room = $("#name_room_txt").val()
      let game_id = $("#game-id").val()
      if(e.originalEvent.keyCode == 32){
        name_room = name_room.replace(/\s/g, '');
        game_id = game_id.replace(/\s/g, '');
        $("#name_room_txt").val(name_room)
        $("#game-id").val(game_id)
      }
    });
  },
  playingAgain: function (){
    let that = this
    $("#button_playin_again").on("click", () => {
      this.channelRoom.push("playing_again", {name_room: that.name_room, username: that.username})
        .receive('ok', response => { console.log(response)
          console.log("ok", response)
          $("#list_users").children(".list-group").children().remove()
          that.processRoom = response.process;
          that.uuid = response.process
          that.username = response.user
          that.uuid_game = response.uuid
          that.updatingPlayers(that.name_room)
          that.initChannelTimer(that.name_room, that.uuid_game)
          HandlebarsResolver.constructor.mergeViewWithModel("#timer_area", response, "timer_run_area")
          HandlebarsResolver.constructor.mergeViewWithModel("#list_users_players", response, "list_user_area")
          $("#container-run-area").hide()
          $("#timer_run_area").show()
          $("#container-header-player").hide()
        })
    })
  },
  buttonFacebook: function () {
    $(".btn-facebook").on("click", () => {

    })
  },
  initValidationsForms: function () {
    $("#register_form").validate({
      rules: {
        'person[username]': {
          required: true,
          normalizer: function(value) {
            return $.trim(value);
          }
        },
        'person[email]': {
          required: true,
        },
        'person[password]': {
          required: true
        }
      }
    });
  },
  assigmentColors: function(){
    let that = this
    $( ".progress-bar" ).each(function(index) {
      $( this ).addClass(that.colors_bar[index]);
    });
  },
  copyToClipboard: function (text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
    $.notify({message: "<i class='fa fa-clipboard' aria-hidden='true'></i> You have the mission's link, just paste it in the chat!" },{ type: 'info'});
  },
  sharedLink: function(){
    let that = this
    $("#link_to_shared").on("click",() => {
      console.log($("#link_input").val())
      that.copyToClipboard($("#link_input").val())
    })
  },

  bindEvents:function (){
    this.initRom()
    this.joinRom()
    this.initChannelPlayers()
    this.initChannelScores()
    this.initChannelRoom()
    //this.scenePlayer()
    this.listnenKeyBoeard()
    this.validateFormRegister()
    this.listenFromListRooms()
    this.joinGameFromUrl()
    this.showingPass()
    this.validateNamesRoom()
    this.playingAgain()
    this.initValidationsForms()
    this.sharedLink()
  },

  testContext: function(){
  },

  start: function(){
    this.bindEvents()
  }

}

