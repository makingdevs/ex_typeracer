# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :keyboard_heroes,
  ecto_repos: [KeyboardHeroes.Repo]

# Configures the endpoint
config :keyboard_heroes, KeyboardHeroesWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "lxMN/1bBaGFkouBrWSBrfC/rkBWWv0sFaW44ytAsQcgR5HNsr/SQNa3zyX0VCtqy",
  render_errors: [view: KeyboardHeroesWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: KeyboardHeroes.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:user_id]

#Configures Guardian

config :keyboard_heroes, KeyboardHeroes.Auth.Guardian,
  issuer: "keyboard_heroes", # Name of your app/company/product
  secret_key: "AVp1NjzxTCrf5467/cGIjkeRxLOkKp5k1b6z9HjkLX0L3L5f5UVHE9uf3MkxnPNE", # Replace this with the output of the mix command
  serializer: KeyboardHeroes.GuardianSerializer

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.

#Config to facebook
config :ueberauth, Ueberauth,
  providers: [
    facebook: {Ueberauth.Strategy.Facebook, []}
  ]

config :ueberauth, Ueberauth.Strategy.Facebook.OAuth,
client_id: System.get_env("FACEBOOK_APP_ID"),
client_secret: System.get_env("FACEBOOK_APP_SECRET")

import_config "#{Mix.env}.exs"
