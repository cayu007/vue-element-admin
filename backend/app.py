from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/hola-mundo')
def hola_mundo():
    return 'Hola mundo lala'

if __name__ == '__main__':
    app.run()