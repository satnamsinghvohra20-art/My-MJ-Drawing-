"""
Localhost Web Server for Spider-Man & Gwen Stacy Simulator
==========================================================
Serves the interactive step-by-step drawing web app on http://localhost:8000
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Disable caching for instant updates
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    # Allow port reuse so restarting doesn't hit 'Address already in use'
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("\n" + "="*60)
        print("  SPIDER-MAN & GWEN STACY - LOCALHOST WEB SERVER")
        print("="*60)
        print(f"  Running locally at: {url}")
        print("  Press Ctrl+C to stop the server.")
        print("="*60 + "\n")
        
        # Try opening browser automatically if running interactively
        try:
            webbrowser.open(url)
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    run_server()
