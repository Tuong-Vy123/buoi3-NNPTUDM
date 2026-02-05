let allProducts = [];
let filteredProducts = [];
let currentPageData = [];
let categories = [];

let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortAsc = true;

const tbody = document.getElementById("tbody");
const pagination = document.getElementById("pagination");

async function loadCategories(){
    const res = await fetch("https://api.escuelajs.co/api/v1/categories");
    categories = await res.json();

    const opts = categories.map(c =>
        `<option value="${c.id}">${c.name}</option>`
    ).join("");

    newCategory.innerHTML = opts;
    editCategory.innerHTML = opts;
}

async function loadData(){
    const res = await fetch("https://api.escuelajs.co/api/v1/products");
    allProducts = await res.json();
    filteredProducts = [...allProducts];
    render();
}

function render(){

    let data = [...filteredProducts];

    if(sortField){
        data.sort((a,b)=>{
            let A = sortField==="title" ? a.title.toLowerCase() : a.price;
            let B = sortField==="title" ? b.title.toLowerCase() : b.price;
            return sortAsc ? (A>B?1:-1):(A<B?1:-1);
        });
    }

    const start = (currentPage-1)*pageSize;
    currentPageData = data.slice(start,start+pageSize);

    tbody.innerHTML = currentPageData.map(p=>{
        const desc = (p.description||"").replace(/"/g,"'");
        return `
        <tr data-bs-toggle="tooltip" title="${desc}" onclick="openDetail(${p.id})">
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>$${p.price}</td>
            <td>${p.category?.name||""}</td>
            <td><img src="${p.images?.[0]||''}" class="thumb"></td>
        </tr>`;
    }).join("");

    new bootstrap.Tooltip(document.body,{selector:'[data-bs-toggle="tooltip"]'});
    renderPagination(data.length);
}

function renderPagination(total){
    const pages = Math.ceil(total/pageSize);
    pagination.innerHTML="";
    for(let i=1;i<=pages;i++){
        pagination.innerHTML +=
        `<li class="page-item ${i===currentPage?'active':''}">
            <a class="page-link" onclick="currentPage=${i};render()">${i}</a>
        </li>`;
    }
}

/* SEARCH */
searchInput.oninput = ()=>{
    const k = searchInput.value.toLowerCase();
    filteredProducts = allProducts.filter(p =>
        p.title.toLowerCase().includes(k));
    currentPage=1;
    render();
};

/* PAGE SIZE */
pageSizeSelect.onchange = ()=>{
    pageSize = +pageSizeSelect.value;
    currentPage=1;
    render();
};

/* SORT */
sortTitle.onclick = ()=>toggleSort("title");
sortPrice.onclick = ()=>toggleSort("price");

function toggleSort(f){
    sortAsc = sortField===f ? !sortAsc : true;
    sortField=f;
    render();
}

/* EXPORT CSV */
exportBtn.onclick = ()=>{
    let csv="ID,Title,Price,Category,Image\n";
    currentPageData.forEach(p=>{
        csv += `${p.id},"${p.title}",${p.price},"${p.category?.name||""}",${p.images?.[0]||""}\n`;
    });

    const blob=new Blob([csv]);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="products_view.csv";
    a.click();
};

/* DETAIL MODAL */
function openDetail(id){
    const p = allProducts.find(x=>x.id==id);
    editId.value=p.id;
    editTitle.value=p.title;
    editPrice.value=p.price;
    editDesc.value=p.description;
    editImg.value=p.images?.[0]||"";
    editCategory.value=p.category?.id;
    new bootstrap.Modal(viewModal).show();
}

/* UPDATE */
saveEdit.onclick = async ()=>{
    await fetch(`https://api.escuelajs.co/api/v1/products/${editId.value}`,{
        method:"PUT",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            title:editTitle.value,
            price:+editPrice.value,
            description:editDesc.value,
            images:[editImg.value],
            categoryId:+editCategory.value
        })
    });
    loadData();
};

/* CREATE */
createBtn.onclick = async ()=>{
    await fetch("https://api.escuelajs.co/api/v1/products",{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            title:newTitle.value,
            price:+newPrice.value,
            description:newDesc.value,
            images:[newImg.value],
            categoryId:+newCategory.value
        })
    });
    loadData();
};

loadCategories();
loadData();