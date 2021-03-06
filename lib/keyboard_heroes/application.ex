defmodule KeyboardHeroes.Application do
  use Application

  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec

    # Define workers and child supervisors to be supervised
    children = [
      # Start the Ecto repository
      supervisor(KeyboardHeroes.Repo, []),
      # Start the endpoint when the application starts
      supervisor(KeyboardHeroesWeb.Endpoint, []),
			#worker(KeyboardHeroes.Timer, []), #init Timer server
      # Start your own worker by calling: KeyboardHeroes.Worker.start_link(arg1, arg2, arg3)
      # worker(KeyboardHeroes.Worker, [arg1, arg2, arg3]),
      {Registry, keys: :unique, name: KeyboardHeroes.GameRegistry},
    ]

		# ETS for save users id
    :ets.new(:mapShared, [:named_table, :public])
    :ets.insert( :mapShared, { "users", %{} } )

		# ETS for save users id
    :ets.new(:list_rooms, [:named_table, :public])
    :ets.insert(:list_rooms, { "list", [] } )

		# ETS for save scores
		:ets.new(:scoresGlobalMap, [:named_table, :public])

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: KeyboardHeroes.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    KeyboardHeroesWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
