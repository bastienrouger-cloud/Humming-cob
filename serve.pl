#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket::INET;
use File::Basename;
use POSIX qw(strftime);

my $port = $ARGV[0] || 8080;
my $root = $ARGV[1] || '.';

my %mime = (
    html => 'text/html; charset=utf-8',
    htm  => 'text/html; charset=utf-8',
    css  => 'text/css',
    js   => 'application/javascript',
    json => 'application/json',
    png  => 'image/png',
    jpg  => 'image/jpeg',
    jpeg => 'image/jpeg',
    gif  => 'image/gif',
    svg  => 'image/svg+xml',
    ico  => 'image/x-icon',
    mp4  => 'video/mp4',
    webm => 'video/webm',
    woff2=> 'font/woff2',
    woff => 'font/woff',
    ttf  => 'font/ttf',
);

my $server = IO::Socket::INET->new(
    LocalPort => $port,
    Type      => SOCK_STREAM,
    Reuse     => 1,
    Listen    => 10,
) or die "Cannot bind port $port: $!\n";

print "Humming Cob dev server listening on http://localhost:$port\n";

while (my $client = $server->accept()) {
    my $request = '';
    while (my $line = <$client>) {
        $request .= $line;
        last if $line eq "\r\n";
    }

    my ($method, $path) = $request =~ /^(\w+)\s+(\S+)/;
    $path ||= '/';
    $path =~ s/\?.*$//;
    $path =~ s|%([0-9A-Fa-f]{2})|chr(hex($1))|ge;
    $path = '/index.html' if $path eq '/';
    $path =~ s|/+|/|g;

    my $file = $root . $path;
    $file =~ s|/|\\|g;

    my ($status, $body, $ct);
    if (-f $file) {
        open(my $fh, '<:raw', $file) or do {
            respond($client, 403, 'text/plain', "Forbidden\n");
            close($client); next;
        };
        local $/; $body = <$fh>; close $fh;
        my ($ext) = $file =~ /\.(\w+)$/;
        $ct = $mime{lc($ext || '')} || 'application/octet-stream';
        $status = 200;
    } else {
        $body = "404 Not Found: $path\n";
        $ct   = 'text/plain';
        $status = 404;
    }

    respond($client, $status, $ct, $body);
    close($client);
}

sub respond {
    my ($sock, $code, $ct, $body) = @_;
    my $len = length($body);
    print $sock "HTTP/1.1 $code OK\r\nContent-Type: $ct\r\nContent-Length: $len\r\nConnection: close\r\n\r\n$body";
}
