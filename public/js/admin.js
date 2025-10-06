document.addEventListener('DOMContentLoaded', function(){
const toggle = document.getElementById('mobile-menu-toggle');
const sidebar = document.getElementById('sidebar');
if(toggle && sidebar){
toggle.addEventListener('click', ()=> sidebar.classList.toggle('open'))
}
});