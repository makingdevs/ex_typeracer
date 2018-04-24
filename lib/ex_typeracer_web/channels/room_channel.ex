defmodule ExTyperacerWeb.RoomChannel do

  alias ExTyperacer.Logic.Game
  alias ExTyperacer.GameServer
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
    IO.inspect "Estoy aquí"
    username = payload["username"]
    game_server = GameServer.start_link(payload["name_room"])
    IO.inspect game_server
    GameServer.add_player game_server, payload["username"]
    players = GameServer.players game_server 
    IO.inspect players
    :ets.new(:"#{payload["name_room"]}", [:named_table, :public])
    :ets.insert(:"#{payload["name_room"]}", {"game", game_server} )
    [{"list", list_rooms}] = :ets.lookup(:list_rooms, "list")
    :ets.insert(:list_rooms, { "list", list_rooms ++ [payload["name_room"]] } )
    IO.inspect "Termino el proceso"
    {:reply,
    {:ok, %{"list" => list_rooms,
            "process" => payload["name_room"],
            "userList" => players,
            "user" => payload["username"]
          }
    },
    socket}
  end

  def handle_in("join_race", payload, socket) do
    username = payload["username"]
    uuidGame = payload["name_room"]
    IO.inspect "Estoy aqui"
    IO.inspect uuidGame
    [{_,game_server}] = :ets.lookup(:"#{uuidGame}","game")
    [{"list", list_rooms}] = :ets.lookup(:list_rooms, "list")
    IO.inspect game_server
    GameServer.add_player game_server, username
    players = GameServer.players game_server 
 #   game = Game.add_player(game, username)
 #   IO.inspect game
 #   :ets.insert(:"#{game.uuid}", {"game", game} )
    {:reply,
    {:ok, %{"list" => list_rooms,
            "process" => payload["name_room"],
            "userList" => players,
            "user" => payload["username"]
          }
    },
    socket}
  end


  def handle_in("get_romms", _payload, socket) do
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
    [{_,game}] = :ets.lookup(:"#{uuidGame}","game")
    broadcast! socket, "updating_player_#{uuidGame}", %{"game" => game}
    {:noreply, socket}
  end

end
