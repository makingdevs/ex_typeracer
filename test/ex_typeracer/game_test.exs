defmodule ExTyperacer.Structs.GameTest do
  use ExUnit.Case
  alias ExTyperacer.Structs.Game
  doctest Game

  @doc """
  We must remove the dependency for obtain text
  """
  test "a new game" do
    game = Game.new()
    assert game.paragraph
    assert Enum.count(game.players) == 0
  end

  test "add a new player" do
    game = Game.new()
    updated_game = Game.add_player(game, "neodevelop")
    assert Enum.count(updated_game.players) == 1
  end

  test "add the same player twice" do
  end

  test "playing the game" do
    game = %{ Game.new() | paragraph: "Hello Typeracer, we're MakingDevs." }
    updated_game = Game.add_player(game, "neodevelop")
    assert updated_game.paragraph == "Hello Typeracer, we're MakingDevs."
    _updated_game = Game.plays game, "neodevelop", "Hello"
  end

end

