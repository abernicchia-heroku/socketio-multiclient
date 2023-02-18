# socket.io multi-client on Heroku

## DISCLAIMER

The author of this article makes any warranties about the completeness, reliability and accuracy of this information. Any action you take upon the information of this website is strictly at your own risk, and the author will not be liable for any losses and damages in connection with the use of the website and the information provided.

## Description

Example of [socket.io](https://socket.io/) multi-client that spawns multiple websocket clients to send and receive events to/from a websocket server

This code can run locally or on Heroku, both on Common Runtime and Private Spaces.
It uses **websocket**-only transport protocol and not **long-polling** as the latter is not currently supported by Private Spaces as [session affinity feature is not available yet](https://blog.heroku.com/session-affinity-ga#getting-started-with-session-affinity).

The clients listens for **s2c-event** and **seq-num** events from server and emit **c2s-event** events. It displays the average packets received per second by the server.

## Setup procedure

Use the following Heroku Button to create an application, all required add-ons and configuration variables will be created automatically.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Once created, scale to 0 the web dyno (not used and created by default) then scale to 1 the worker dyno.
```
heroku ps:scale web=0 worker=1
```


Otherwise, use the following procedure to deploy the application manually:

```
git clone https://github.com/abernicchia-heroku/socketio-multiclient.git
cd socketio-multiclient
heroku create
heroku addons:create papertrail
git add .
git commit -m "starting point"
git push heroku main
heroku ps:scale web=0 worker=1
```

## Environment variables configuration

The following configuration variables are used by the application:

**CLIENT_WSSERVERURL**: Websocket server URL (e.g. wss://socketio-server.herokuapp.com, ws://socketio-server.herokuapp.com, https://socketio-server.herokuapp.com, http://socketio-server.herokuapp.com)

**MAX_CLIENTS**: Number of parallel clients.

**CLIENT_CREATION_INTERVAL_IN_MS**: Delay time in milliseconds before creating a new client.

**EMIT_INTERVAL_IN_MS**: Emitting events frequency in milliseconds.


## Test

You can test your multi-client using any socket.io compatible server like this compound [server](https://github.com/abernicchia-heroku/socketio-server) that creates multiple socket.io servers and is able to handle the events sent/received by the client.

It's possible to enable debug messages (e.g. when events are emitted or received) setting LOG_LEVEL=debug.














