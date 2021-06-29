const roles = [
    {code:"ROLE_USER",label:"Utilisateur"},
    {code:"ROLE_ADMIN",label:"Administrateur"}
];

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
                    { key: 'name', label: 'Nom', sortable: true, sortDirection: 'desc' },
                    { key: 'email', label: 'Email de connexion', sortable: true, sortDirection: 'desc' },
                    { key: 'role', label: 'Role', sortable: true, sortDirection: 'desc' },
                    { key: 'actions', label: 'Actions' }
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
/**
                    this.items = [{
                        "_id" : "5ede3243aaadaa1edc0d40c3",
                        "role" : [
                            "user"
                        ],
                        "name" : "Stephane Lamasse",
                        "email" : "stephane.lamasse@univ-paris1.fr",
                    },
                        {
                            "_id" : "5ede3243aaadaa1edc0d40c3",
                            "role" : [
                                "user"
                            ],
                            "name" : "Stephane Lamasse 2",
                            "email" : "stephane.lamasse@univ-paris1.fr",
                        }
                        ,{
                            "_id" : "5ede3243aaadaa1edc0d40c3",
                            "role" : [
                                "user"
                            ],
                            "name" : "Stephane Lamasse 3",
                            "email" : "stephane.lamasse@univ-paris1.fr",
                        }];
*/
                    const result = await fetch(`${apiUrl}/user`,{
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
                add : async function(){
                    console.log("add :"+JSON.stringify(this.newUser));
                    const result = await fetch(`${apiUrl}/user`,{
                        'method':'POST',
                        'headers':{
                            'Content-Type':'application/json',
                            'Authorization':'Bearer'+sessionToken,
                        },
                        'body': JSON.stringify(this.newUser),
                    });
                    this.newUser = {
                        name:'',
                            email:'',
                            password:'',
                            role:[]
                    };
                    this.list();

                },
                edit : async function(){

                },
                reinitPwd : async function(id){
                    console.log("reinitPwd :"+id);
                    const request = {
                        "newPwd": "password"
                    }
                    const result = await fetch(`${apiUrl}/user/init-pwd/`+id,{
                        'method':'POST',
                        'headers':{
                            'Content-Type':'application/json',
                            'Authorization':'Bearer'+sessionToken,
                        },
                        body:JSON.stringify(request)
                    });
                },
                remove : async function(id){
                    console.log("remove :"+id);
                    const result = await fetch(`${apiUrl}/user/`+id,{
                        'method':'DELETE',
                        'headers':{
                            'Content-Type':'application/json',
                            'Authorization':'Bearer'+sessionToken,
                        },
                    });
                    this.list();
                }
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


