#!/usr/bin/env ruby
require "rubygems"
require "em-websocket"
id=0
connections = []
EventMachine::WebSocket.start(:host => "0.0.0.0", :port => ARGV[0]) do |ws|
	my_id = (id+=1)
	ws.onopen {
		connections << ws
		puts "new client, id=#{my_id}"
	}
	ws.onclose {
		puts "lost connection"
		connections.delete ws
	}
	ws.onmessage {|data|
		puts "#{my_id} = #{data}"
		connections.each do |connection|
			next if connection == ws
			connection.send "{ id: #{my_id}, data: #{data} }"
		end
	}
end
