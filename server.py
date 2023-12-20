from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)
CORS(app)  # Esto permite que cualquier origen acceda a tu servidor, útil para desarrollo

@app.route('/api/python-demo')
def python_demo():
    return jsonify({"message": "¡Hola desde Python!"})
@app.route('/scrape', methods=['POST'])
def scrape_url():
    url = request.json.get('url')
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    headers = [h.get_text() for h in soup.find_all('h1')]
    return jsonify(headers=headers)


if __name__ == '__main__':
    app.run(debug=True, port=5001)