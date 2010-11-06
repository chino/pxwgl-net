#!/usr/bin/env ruby
require "./lib/web-socket-ruby/lib/web_socket.rb"
server = WebSocketServer.new(
	:port => 8080, 
	:accepted_domains => ["fly.thruhere.net"]
)
id=0
connections = []
server.run() do |connection|
	begin
		my_id = (id+=1)
		connections << connection
		puts "new client, id=#{my_id}, uri=#{connection.path}"
		connection.handshake
		while data = connection.receive
			puts "#{my_id} = #{data}"
			connections.each do |c|
				next if c == connection
				c.send "{ id: #{my_id}, data: #{data} }"
			end
		end	
	ensure
		connections.delete connection
	end
end
