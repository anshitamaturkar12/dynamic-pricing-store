function addProduct() {
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;

    fetch("http://127.0.0.1:5000/admin/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            base_price: price,
            image: image
        })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

function deleteProduct() {
    const id = document.getElementById("deleteId").value;

    fetch(`http://127.0.0.1:5000/admin/delete-product/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}