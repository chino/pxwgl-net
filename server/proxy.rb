#!/usr/bin/env ruby
require "./lib/web-socket-ruby/lib/web_socket.rb"
def die msg="I died"
	puts msg
	exit 1
end
def usage
	die "Usage: #{$0} <host> <port> <domain>"
end
usage if ARGV.length < 3
server = WebSocketServer.new(
	:host => ARGV[0],
	:port => ARGV[1],
	:accepted_domains => [ARGV[3]]
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
