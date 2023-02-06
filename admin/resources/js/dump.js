var messages = null;

fetch(resourceUrl+'/messages.json')
    .then(function(response) { return response.json(); })
    .then(function(data) {
        messages = data.fr;
    })
    .then(function(){
        window.app = new Vue({
            el: '#app',
            data: {
                items: [],
                fields: [
                    { key: '_id', label: '#'},
                    { key: 'name', label: 'Nom'}
                ],
                totalRows: 0,
                totalCount: 0,
                currentPage: 1,
                nbPage:0,
                perPage: 10,
                pageOptions: [5, 10, 15, 100],
                sortBy: '',
                sortDesc: false,
                sortDirection: 'asc',
                filter: null,
                filterOn: [],
                infoModal: {
                    id: 'info-modal',
                    title: '',
                    content: ''
                },
                newUser:{
                    name:'',
                    email:'',
                    password:'',
                    role:[]
                }
            },
            methods: {
                onFiltered : function(filteredItems) {
                    // Trigger pagination to update the number of buttons/pages due to filtering
                    this.totalRows = filteredItems.length
                    this.currentPage = 1
                },
                list : async function(){
                    
                    console.log("list");
                    //let url = `${apiUrl}/admin/dump`;
                    //mode mock
                    let url =`${publicUrl}/mock/dump.json`;
                    url+="?page=1&rows=50";
                    const result = await fetch(url,{
                        'method':'GET',
                        'headers':{
                            'Content-Type':'application/json',
                            'Authorization':'Bearer'+sessionToken,
                        },
                    });
                    this.items = await result.json();
                    this.totalCount = this.items.length;;//3;//result.headers.get('X-Total-Count');
                    this.totalRows = this.items.length;
                    this.nbPage = 1;//Math.ceil(this.totalCount / this.perPage);
                    console.log("list done");

                },
                new : async function(){
                    console.log("new dump");
                    const result = await fetch(`${apiUrl}/admin/dump`,{
                        'method':'POST',
                        'headers':{
                            'Content-Type':'application/json',
                            'Authorization':'Bearer'+sessionToken,
                        },
                        'body': {},
                    });
                    
                    if(result.status != 200){
                        alert("Erreur technique");
                    }
                    this.list();

                },
            },
            created() {
                this.list();
            },
            computed: {
                sortOptions() {
                    // Create an options list from our fields
                    return this.fields
                        .filter(f => f.sortable)
                        .map(f => {
                            return { text: f.label, value: f.key }
                        })
                }
            }
        })
    });
