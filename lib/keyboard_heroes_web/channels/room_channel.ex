defmodule KeyboardHeroesWeb.RoomChannel do

  alias KeyboardHeroes.Logic.Game
  alias KeyboardHeroes.GameServer
  alias KeyboardHeroes.Logic.PersonRepo
  require Logger

  use Phoenix.Channel

  def join("room:new", _payload, socket) do
    Logger.info ":: Room:channel:: Conexión a una sala"
    {:ok, socket}
  end

  def handle_in("get_text", _payload, socket) do
    {:noreply, socket}
  end

  def handle_in("init_reace", payload, socket) do
    username = payload["username"]
    [game_server, players, game, list_rooms] = init_game(payload)
    IO.inspect "Termino el proceso"
    {:reply,
    {:ok, %{"list" => list_rooms,
            "process" => payload["name_room"],
            "userList" => players,
            "user" => payload["username"],
            "uuid" => game.uuid,
            "link_to_shared" => "#{Application.get_env(:keyboard_heroes, KeyboardHeroesWeb.Endpoint)[:base_url]}/racer/#{payload["name_room"]}"
          }
    },
    socket}
  end

  def handle_in("join_race", payload, socket) do

    IO.inspect "Estoy aqui"
    [game_server, game, players, list_rooms] = join_game(payload)
 #   game = Game.add_player(game, username)
 #   IO.inspect game
 #   :ets.insert(:"#{game.uuid}", {"game", game} )
    {:reply,
    {:ok, %{"list" => list_rooms,
            "process" => payload["name_room"],
            "userList" => players,
            "user" => payload["username"],
            "uuid" => game.uuid,
            "status" => game.status
          }
    },
    socket}
  end

  def handle_in("get_romms", _payload, socket) do
    # TODO: Don't get from ETS, use a GenServer instead
    [{_, list_rooms}] = :ets.lookup(:list_rooms, "list")
    broadcast! socket, "list_rooms", %{"rooms" => list_rooms}
    {:noreply, socket}
  end

  def handle_in("show_run_area", uuidGame, socket) do
    IO.inspect "Aquí truena"
    IO.inspect uuidGame
    [{_,game_server}] = :ets.lookup(:"#{uuidGame}","game")
    IO.inspect game_server
    paragraph = GameServer.paragraph_of_game(game_server)
    broadcast! socket, "#{uuidGame}", %{"data" => paragraph }
    {:noreply, socket}
  end

  def handle_in("updating_players", uuidGame, socket) do
    IO.puts "Truena...."
    IO.inspect uuidGame
    [{_,game_server}] = :ets.lookup(:"#{uuidGame}","game")
    game = GameServer.get_game game_server
  #  broadcast! socket, "updating_player_#{uuidGame}",
  #  %{"game" => game,
  #    "winner" => "Ninguno"
  #  }
    broadcast! socket, "updating_player_#{uuidGame}", %{"game" => %{players: game.players} }
    {:noreply, socket}
  end

  def handle_in("exist_username", %{}, socket) do
    {:noreply, socket}
  end

  def handle_in("exist_username", username, socket) do
    existed = PersonRepo.find_user_by_username username
    if existed do
      existed = true
    else
      existed = false
    end
    {:reply, {:ok, %{existed: existed}}, socket}
  end


  def handle_in("exist_email", %{}, socket) do
    {:noreply, socket}
  end

  def handle_in("exist_email", email, socket) do
    existed = PersonRepo.find_user_by_email email
    if existed do
      existed = true
    else
      existed = false
    end
    {:reply, {:ok, %{existed: existed}}, socket}
  end

  def handle_in("recovery_pass", email, socket) do
    existed = PersonRepo.find_user_by_email email
    if existed do
      IO.inspect existed.id
      PersonRepo.send_email_token_recovery existed
      existed = true
    else
      existed = false
    end
    {:reply, {:ok, %{existed: existed}}, socket}
  end

  def handle_in("playing_again", payload, socket) do
    IO.inspect "Reinicia juego"
    [game_server, game, players, list_rooms] =
    if checking_game(payload["name_room"]) do
      IO.inspect " Te unes al juego "
      join_game(payload)
    else
      IO.inspect "Inicia juego "
      IO.inspect payload
      init_game(payload)
    end
    {:reply, {:ok, %{
            "list" => list_rooms,
            "process" => payload["name_room"],
            "userList" => players,
            "user" => payload["username"],
            "uuid" => game.uuid,
            "status" => game.status

    }}, socket}
  end

  defp init_game(payload) do
    game_server = GameServer.start_link(payload["name_room"])
    IO.inspect game_server
    GameServer.add_player game_server, payload["username"]
    players = GameServer.players game_server
    game = GameServer.get_game game_server
    IO.inspect players
    # TODO: Use a GenServer
    :ets.new(:"#{payload["name_room"]}", [:named_table, :public])
    :ets.insert(:"#{payload["name_room"]}", {"game", game_server} )
    [{"list", list_rooms}] = :ets.lookup(:list_rooms, "list")
    :ets.insert(:list_rooms, { "list", list_rooms ++ [payload["name_room"]] } )
    GameServer.start_timer_waiting(game_server, 60)
    [game_server, players, game, list_rooms]
  end

  defp join_game(payload) do
    username = payload["username"]
    uuidGame = payload["name_room"]
    [{_,game_server}] = :ets.lookup(:"#{uuidGame}","game")
    [{"list", list_rooms}] = :ets.lookup(:list_rooms, "list")
    IO.inspect game_server
    GameServer.add_player game_server, username
    game = GameServer.get_game game_server
    players = GameServer.players game_server
    [game_server, game, players, list_rooms]
  end

  defp checking_game(name_game) do
    [{"list", list_rooms}] = :ets.lookup(:list_rooms, "list")
    Enum.member?(list_rooms, name_game)
  end



end