import multiprocessing
from flask import Flask
from api.routes import init_routes

# Set the start method to 'spawn'
multiprocessing.set_start_method('spawn', force=True)

app = Flask(__name__)

# Initialize routes
init_routes(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
