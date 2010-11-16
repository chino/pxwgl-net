#!/usr/bin/env ruby
require 'rubygems'
require 'eventmachine'
class Client < EM::Connection
	attr_accessor :proxy
	def post_init
		puts "connected to localhost"
		@proxy = nil
	end
	def unbind
		puts "localhost closed session"
	end
	def receive_data data
		puts "receiving data from localhost and sending back to browser"
		@proxy.send_data data unless @proxy.nil?
	end
end
class Proxy < EM::Connection
	attr_accessor :client
	def post_init
		@first_packet = true
		@client = nil
		puts "new request"
	end
	def unbind
		puts "browser closed session"
	end
	def receive_data data
		if @first_packet
			@first_packet = false
			@web_socket = data =~ /Upgrade:\s+WebSocket/
			port = @web_socket ? 8081 : 80
			puts "connecting to localhost:#{port}"
			@client = EventMachine::connect( 'localhost', port, Client );
			@client.proxy = self
		end
		puts "sending data from browser to localhost"
		@client.send_data data unless @client.nil?
	end
end
EventMachine::run {
	EventMachine::start_server '0.0.0.0', 8080, Proxy
}
