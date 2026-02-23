from flask import Flask, jsonify, render_template
from flask_cors import CORS
import mysql.connector

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Anshi@123",  # <-- Apna MySQL password
        database="dynamic_pricing"
    )

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/products", methods=["GET"])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)

@app.route("/update-product/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = None
    try:
        from flask import request
        data = request.json
        new_demand = int(data.get("demand", 0))
    except:
        return jsonify({"error": "Invalid JSON"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT base_price FROM products WHERE id=%s", (product_id,))
    product = cursor.fetchone()

    if not product:
        cursor.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    base = float(product["base_price"])
    growth_factor = 0.0005  # smooth decimal increment per demand
    new_price = round(base * (1 + growth_factor * new_demand), 2)

    cursor.execute(
        "UPDATE products SET demand=%s, price=%s WHERE id=%s",
        (new_demand, new_price, product_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"status": "success", "new_price": new_price, "demand": new_demand})

if __name__ == "__main__":
    app.run(debug=True, port=5000)