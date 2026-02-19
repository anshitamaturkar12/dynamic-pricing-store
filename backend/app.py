from flask import Flask, jsonify, render_template, request
import mysql.connector

app = Flask(__name__)

# ✅ Database Connection Function
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Anshi@123",
        database="dynamic_pricing",
        connection_timeout=5
    )

# ✅ Home Page
@app.route("/")
def home():
    return render_template("index.html")

# ✅ Get All Products (Frontend ke liye)
@app.route("/products")
def get_products():
    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products")
        products = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify(products)

    except Exception as e:
        return jsonify({"error": str(e)})

# ✅ Admin Update Price & Demand
@app.route("/update-product/<int:id>", methods=["PUT"])
def update_product(id):
    try:
        data = request.json
        new_price = data.get("price")
        new_demand = data.get("demand")

        # 🔥 Simple Dynamic Pricing Logic
        if new_demand > 50:
            new_price = new_price + (new_price * 0.10)  # +10%
        elif new_demand < 20:
            new_price = new_price - (new_price * 0.05)  # -5%

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "UPDATE products SET price=%s, demand=%s WHERE id=%s",
            (new_price, new_demand, id)
        )

        db.commit()
        cursor.close()
        db.close()

        return jsonify({"message": "Product updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)