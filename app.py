from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3

app = Flask(__name__)


# =========================
# DATABASE CONNECTION
# =========================

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


# =========================
# HOME PAGE / DASHBOARD
# =========================

@app.route("/")
def home():

    conn = get_db()

    products = conn.execute(
        "SELECT * FROM inventory ORDER BY id DESC"
    ).fetchall()

    low_stock_products = conn.execute(
        """
        SELECT * FROM inventory
        WHERE quantity <= minimum_stock
        ORDER BY quantity ASC
        """
    ).fetchall()

    conn.close()

    total_products = len(products)

    total_stock = sum(
        product["quantity"]
        for product in products
    )

    low_stock = len(low_stock_products)

    return render_template(
        "index.html",
        products=products,
        total_products=total_products,
        total_stock=total_stock,
        low_stock=low_stock,
        low_stock_products=low_stock_products
    )


# =========================
# MANUAL ADD PRODUCT
# =========================

@app.route("/add-product", methods=["POST"])
def add_product():

    product_name = request.form["product_name"]
    quantity = int(request.form["quantity"])
    price = float(request.form["price"])
    unit = request.form["unit"]
    minimum_stock = int(request.form["minimum_stock"])

    conn = get_db()

    conn.execute(
        """
     
    INSERT INTO inventory
    (product_name, quantity, price, unit, minimum_stock)
    VALUES (?, ?, ?, ?, ?)
    """,
    (
        product_name,
        quantity,
        price,
        unit,
        minimum_stock
    )

    )

    conn.commit()
    conn.close()

    return redirect(url_for("home"))


# =========================
# VOICE ADD PRODUCT
# =========================

@app.route("/voice-add", methods=["POST"])
def voice_add():

    data = request.get_json()

    product_name = data["product"]
    quantity = int(data["quantity"])
    price = float(data["price"])

    conn = get_db()

    existing_product = conn.execute(
        """
        SELECT * FROM inventory
        WHERE LOWER(product_name) = LOWER(?)
        """,
        (product_name,)
    ).fetchone()

    if existing_product:

        new_quantity = (
            existing_product["quantity"] + quantity
        )

        conn.execute(
            """
            UPDATE inventory
            SET quantity = ?, price = ?
            WHERE id = ?
            """,
            (
                new_quantity,
                price,
                existing_product["id"]
            )
        )

        message = (
            f"{product_name} updated. "
            f"New quantity: {new_quantity}"
        )

    else:

        conn.execute(
            """
            INSERT INTO inventory
            (product_name, quantity, price, minimum_stock)
            VALUES (?, ?, ?, ?)
            """,
            (
                product_name,
                quantity,
                price,
                5
            )
        )

        message = (
            f"{product_name} added successfully!"
        )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": message
    })


# =========================
# VOICE SEARCH PRODUCT
# =========================

@app.route("/voice-search", methods=["POST"])
def voice_search():

    data = request.get_json()

    product_name = data["product"].strip()

    conn = get_db()

    product = conn.execute(
        """
        SELECT * FROM inventory
        WHERE LOWER(product_name) LIKE LOWER(?)
        """,
        ("%" + product_name + "%",)
    ).fetchone()

    conn.close()

    if product:

        return jsonify({
            "success": True,
            "product": product["product_name"],
            "quantity": product["quantity"],
            "price": product["price"],
            "message":
                f"You have {product['quantity']} "
                f"{product['product_name']} in stock."
        })

    else:

        return jsonify({
            "success": False,
            "message":
                f"{product_name} was not found in your inventory."
        })


# =========================
# VOICE UPDATE STOCK
# =========================

@app.route("/voice-update", methods=["POST"])
def voice_update():

    data = request.get_json()

    product_name = data["product"].strip()
    quantity = int(data["quantity"])

    conn = get_db()

    product = conn.execute(
        """
        SELECT * FROM inventory
        WHERE LOWER(product_name) LIKE LOWER(?)
        """,
        ("%" + product_name + "%",)
    ).fetchone()

    if product:

        new_quantity = (
            product["quantity"] + quantity
        )

        conn.execute(
            """
            UPDATE inventory
            SET quantity = ?
            WHERE id = ?
            """,
            (
                new_quantity,
                product["id"]
            )
        )

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "product": product["product_name"],
            "quantity": new_quantity,
            "message":
                f"Added {quantity} more "
                f"{product['product_name']}. "
                f"New stock: {new_quantity}"
        })

    else:

        conn.close()

        return jsonify({
            "success": False,
            "message":
                f"{product_name} was not found in inventory."
        })


# =========================
# VOICE SELL PRODUCT
# =========================

@app.route("/voice-sell", methods=["POST"])
def voice_sell():

    data = request.get_json()

    product_name = data["product"].strip()
    quantity = int(data["quantity"])

    conn = get_db()

    product = conn.execute(
        """
        SELECT * FROM inventory
        WHERE LOWER(product_name) LIKE LOWER(?)
        """,
        ("%" + product_name + "%",)
    ).fetchone()

    if product:

        if product["quantity"] < quantity:

            conn.close()

            return jsonify({
                "success": False,
                "message":
                    f"Not enough stock. "
                    f"Only {product['quantity']} "
                    f"{product['product_name']} available."
            })

        new_quantity = (
            product["quantity"] - quantity
        )

        conn.execute(
            """
            UPDATE inventory
            SET quantity = ?
            WHERE id = ?
            """,
            (
                new_quantity,
                product["id"]
            )
        )

        conn.commit()
        conn.close()

        total_amount = (
            quantity * product["price"]
        )

        return jsonify({
            "success": True,
            "product": product["product_name"],
            "sold": quantity,
            "quantity": new_quantity,
            "price": product["price"],
            "total": total_amount,
            "message":
                f"Sold {quantity} "
                f"{product['product_name']} successfully."
        })

    else:

        conn.close()

        return jsonify({
            "success": False,
            "message":
                f"{product_name} was not found in inventory."
        })


# =========================
# VOICE DELETE / REMOVE STOCK
# =========================

@app.route("/voice-delete", methods=["POST"])
def voice_delete():

    data = request.get_json()

    product_name = data["product"].strip()
    quantity = int(data["quantity"])

    conn = get_db()

    product = conn.execute(
        """
        SELECT * FROM inventory
        WHERE LOWER(product_name) LIKE LOWER(?)
        """,
        ("%" + product_name + "%",)
    ).fetchone()

    if product:

        if product["quantity"] < quantity:

            conn.close()

            return jsonify({
                "success": False,
                "message":
                    f"Cannot remove {quantity}. "
                    f"Only {product['quantity']} "
                    f"{product['product_name']} available."
            })

        new_quantity = (
            product["quantity"] - quantity
        )

        conn.execute(
            """
            UPDATE inventory
            SET quantity = ?
            WHERE id = ?
            """,
            (
                new_quantity,
                product["id"]
            )
        )

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "product": product["product_name"],
            "deleted": quantity,
            "quantity": new_quantity,
            "message":
                f"Removed {quantity} "
                f"{product['product_name']}. "
                f"Remaining stock: {new_quantity}"
        })

    else:

        conn.close()

        return jsonify({
            "success": False,
            "message":
                f"{product_name} was not found in inventory."
        })


# =========================
# RUN APPLICATION
# =========================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8000,
        debug=True
    )