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

# ✅ Get All Products
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

# ✅ Admin Update Price & Demand (With New Affordable Logic)
@app.route("/update-product/<int:id>", methods=["PUT"])
def update_product(id):
    try:
        data = request.json
        new_demand = int(data.get("demand", 0))
        
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        
        # Hamesha base_price se calculate karein taaki jump na aaye
        cursor.execute("SELECT base_price FROM products WHERE id=%s", (id,))
        product = cursor.fetchone()
        
        if product:
            base = float(product['base_price'])
            
            # 🔥 AFFORDABLE FORMULA:
            # Har 1 demand par 0.05% price badhegi.
            # Example: 1000 ki cheez 10 demand par 1005 ki hogi (Sirf ₹5 ka fark)
            growth_factor = 0.0005 
            new_price = round(base + (base * growth_factor * new_demand), 2)

            cursor.execute(
                "UPDATE products SET price=%s, demand=%s WHERE id=%s",
                (new_price, new_demand, id)
            )
            db.commit()
            return jsonify({"message": "Price updated smoothly", "price": new_price})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    app.run(debug=True)