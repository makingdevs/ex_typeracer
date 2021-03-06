defmodule KeyboardHeroes.Logic.GameTest do

  @moduledoc """
  Maybe we should move the paragraph getting to a module
  """

  use ExUnit.Case
  alias KeyboardHeroes.Logic.Game
  alias KeyboardHeroes.Logic.Player
  doctest Game


  @doc """
  We must remove the dependency for obtain text
  """
  test "a new game" do
    game = Game.new("Hello world")
    assert game.paragraph
    assert Enum.count(game.players) == 0
  end

  test "add a new player" do
    game = Game.new("Hello MD")
    game = Game.add_player(game, "neodevelop")
    assert Enum.count(game.players) == 1
  end

  test "add the same player twice" do
  end

  test "playing the game with a correct word" do
    game = Game.new("Hello MakingDevs.") |> Game.add_player("neodevelop")
    assert game.paragraph == "Hello MakingDevs."

    game = type_a_word_in_the_game_for_user("Hello", game, "neodevelop")
    player = Enum.find(game.players, fn %Player{username: "neodevelop"} -> :ok end)
    assert player.counting?
    assert player.paragraph_typed == "Hello"
    assert player.score == 29
    assert Enum.count(game.players) == 1
  end

  test "playing the game with an incorrect word" do
    game = Game.new("Hello MakingDevs.") |> Game.add_player("neodevelop")
    assert game.paragraph == "Hello MakingDevs."

    game = type_a_word_in_the_game_for_user("He1lo", game, "neodevelop")
    player = Enum.find(game.players, fn %Player{username: "neodevelop"} -> :ok end)
    assert player.paragraph_typed == "He1lo" # This is the wrong word typed
    assert player.score == 12
    assert player.counting? == false
  end

  test "a player wins the game" do
    game = Game.new("Hello MakingDevs.") |> Game.add_player("neodevelop")
    game = type_a_word_in_the_game_for_user("Hello MakingDevs.", game, "neodevelop")
    [player | _tail] = game.players
    [first | _tail] = game.positions
    assert player.paragraph_typed == "Hello MakingDevs."
    assert player.score == 100
    assert first.username == "neodevelop"
  end

  defp type_a_word_in_the_game_for_user(word, game, user) do
    word
    |> String.codepoints
    |> Enum.reduce(game, fn letter, the_game -> Game.plays(the_game, user,letter) end)
  end

end

