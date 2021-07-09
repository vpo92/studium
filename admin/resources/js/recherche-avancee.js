const disciplines = [
    {code:"ALL",label:"Tous"},
    {code:"ART",label:"Art"},
    {code:"DROIT",label:"Droit"},
    {code:"DROIT.*CANON",label:"Droit canon"},
    {code:"DROIT.*CIVIL",label:"Droit civil"},
    {code:"DECINE",label:"Médecine"},
    {code:"TH.OLOGIE",label:"Théologie"},
    {code:"UTROQUE", label:"In utroque jure"}
];

const sexe = [
    {code:"male", label:"Homme"},
    {code:"female", label:"Femme"},
]

const grades = [
    {code:"ALL",label:"Tous"},
    {code:"MAGIS",label:"Magister"},
    {code:"DOC",label:"Docteur"},
    {code:"MA.TRE",label:"Maître"},
    {code:"LIC",label:"Licencié"},
    {code:"BAC",label:"Bachelier"},
    {code:"TUD",label:"Étudiant"},
    {code:"AUCUN", label:"Aucun"},
];

const status = [
    {code:"MA",label:"Maître"},
    {code:"GRAD",label:"Gradué"},
    {code:"TUD",label:"Étudiant"},
    {code:"SUP",label:"Suppôt"},
    {code:"EXT",label:"Extérieur"},
    {code:"INC",label:"Incertain"},
];


const addOption = [
    {code: 'AND',label: 'et'},
    {code: 'OR',label: 'ou'},
    {code: 'OR NOT',label: 'ou différent de'},
    {code: 'AND NOT',label: 'et différent de'}
];

const searchOption = [
    {code: 'CONTAINS',label: 'contient'},
    {code: 'EQUALS',label: 'égale à'},
    {code: 'STARTS', label: 'commence par'},
    {code: 'END', label: 'termine par'}
];

const prosopographyEntries = {
    "identity": [
        "name",
        "nameVariant",
        "shortDescription",
        "datesOfLife",
        "datesOfActivity",
        "activityMediane",
        "gender",
        "status",
    ],
    "origin": [
        "birthPlace",
        "diocese",
        "movesInOutParis",
    ],
    "relationalInsertion": [
        "socialClassOrigin",
        "familyNetwork",
        "personalSocialClass",
        "personalServicesRelationship",
        "friends",
        "controversyOrDebates",
        "connectionsWith",
        "memberOfGroups",
        "politicalRelationships",
        "professionalRelationships",
        "willExecutor",
        "studentProfessorRelationships",
    ],
    "curriculum": [
        "preUniversity",
        "university",
        "grades",
        "universityCollege",
        "collegeFundations",
    ],
    "ecclesiasticalCareer": [
        "ecclesiasticalStatus",
        "secularPosition",
        "benefits",
        "regularOrder",
        "regularFunctions",
        "popFunctions",
        "otherFunctions",
        "communityFundations",
    ],
    "professionalCareer": [
        "professorOrPerceptor",
        "universityFunction",
        "lawFunction",
        "propertiesAdministrator",
        "townAdministrator",
        "culturalFunction",
        "kingdowChurchFunction",
        "kingdomCulturalFunction",
        "kingdomVariousFunction",
        "royalAdministration",
        "localAdministrationFunction",
        "representation",
        "business",
        "medicine",
        "otherJob",
    ],

    "politicalCareer": [
        "importantPosition",
        "jailed",
        "violentDeath",
        "exil",
        "justiceFacts",
    ],

    "travels": [
        "travels",
    ],
    "commissions": [
        "universityCommission",
        "otherCommission",
    ],
    "assets": [
        "parisHousing",
        "otherHousing",
        "incomes",
        "will",
        "gifts",
    ],
    "distinctiveSign": [
        "emblems",
        "seals",
    ],
    "orality": [
        "orality",
    ],
    "otherActivities": [
        "otherActivities",
    ],

};




const getChapter = () => {
    return Object.keys(prosopographyEntries).map( item => {
        console.log(messages[item]);
        return {
            code: item,
            label: messages[item],
        };
    });
}

const getSubChapter = (chapter) => {
    return Object.keys(chapter).map( item => {
        //const k = localeData.fr[chapter[item]];
        const k = chapter[item];
        return {
            code: k,
            label: messages[k],
        };
    });
}



Vue.component('search-criterion', {
    props: ["prosopography","rows"],
    data: function () {
        return {
            operatorList: addOption,
            chapterList: getChapter(),
            subChapterList: [],
            searchOptionList: searchOption,
            selectedOperator: "AND",
            selectedChapter:null,
            selectedSubChapter:null,
            selectedSearchOption:null
        }
    },

    methods: {
        handleChapterChange : function(){
            this.subChapterList = getSubChapter(prosopographyEntries[this.prosopography.section]);
        }
    },
    template: `<div class="row">
        <div class="col">
            <select v-model="prosopography.operator">
                <option v-for="option in operatorList" v-bind:value="option.code" selected="selected">{{ option.label }}</option>
            </select>
        </div>
        <div class="col">
            <select v-model="prosopography.section" @change="handleChapterChange()">
                <option v-for="option in chapterList" v-bind:value="option.code" >{{ option.label }}</option>
            </select>
        </div>
        <div class="col">
            <select v-model="prosopography.subSection">
                <option v-for="option in subChapterList" v-bind:value="option.code" >{{ option.label }}</option>
            </select>
        </div>
        <div class="col">
            <select v-model="prosopography.matchType">
                <option v-for="option in searchOptionList" v-bind:value="option.code" >{{ option.label }}</option>
            </select>
        </div>
        <div class="col">
            <input type="text" v-model="prosopography.value">
        </div>
        <div class="col">
            <button v-if="rows > 1" v-on:click="$emit('remove-row')">
                <i class="fas fa-minus-circle"></i>
            </button>
            <button v-on:click="$emit('add-row')">
                <i class="fas fa-plus-circle"></i>
            </button>

        </div>

    </div>`
})


Vue.component('prosopography-row', {
    props: ['record'],
    template: `<tr>
        <th scope="row">{{record.reference}}</th>
        <td>{{record.identity.name.value}}</td>
        <td>{{record.identity.status.value}}</td>
        <td>{{record.identity.shortDescription.value}}</td>
        <td><a class="btn btn-primary" :href="'.'+record.link">voir la fiche </a></td>
    </tr>`
})

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
                searchRequest: {
                    activityMediane: {
                        from: null,
                        to: null,
                    },
                    activity: {
                        start: {
                            from : null,
                            to : null,
                        },
                        end: {
                            from : null,
                            to : null,
                        }
                    },
                    status: [],
                    sexe: [],
                    graph: false,
                    grade: null,
                    discipline: null,
                    name: null,
                    prosopography: [{
                        section: null,
                        subSection: null,
                        operator: "AND",
                        matchType: null,
                        value: null,
                    }]
                },
                searching: false,
                statusList:status,
                sexeList:sexe,
                disciplineList:disciplines,
                gradeList:grades,
                vizualisation : false,
                items: [],
                fields: [
                    { key: 'reference', label: 'Référence', sortable: true, sortDirection: 'desc' },
                    { key: 'identity.name[0].value', label: 'Nom', sortable: true, sortDirection: 'desc' },
                    { key: 'identity.status[0].value', label: 'Statut', sortable: true, sortDirection: 'desc' },
                    { key: 'identity.shortDescription[0].value', label: 'Description', sortable: true, sortDirection: 'desc' },
                    { key: 'datesOfActivity', label: 'Date d\'activité', sortable: true, sortDirection: 'desc' },
                    { key: 'extras.activityMediane', label: 'Mediane', sortable: true, class: 'text-center' },
                    { key: 'curriculum.grades[0].value', label: 'Dernier grade', sortable: true, class: 'text-center' },
                    { key: 'nbGrades', label: 'Nombre de grades', sortable: true, class: 'text-center' },
                    { key: 'originDiocese', label: 'Diocèse d\'origine', sortable: true, class: 'text-center' },
                    { key: 'updateDate', label: 'Dernière actualisation', sortable: true, class: 'text-center' },
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
            },
            methods: {

                handleChapterChange: function(){
                    this.subChapterList = getSubChapter(prosopographyEntries[this.searchRequest.prosopography.section]);
                },
                handleAddProsopographyRow: function(){
                    this.searchRequest.prosopography.push({
                        section: null,
                        subSection: null,
                        operator: "AND",
                        matchType: null,
                        value: null,
                    });
                },
                handleRemoveProsopographyRow: function(item){
                    console.log(item);
                    for( var i = 0; i < this.searchRequest.prosopography.length; i++){
                        if ( this.searchRequest.prosopography[i] == item) {
                            this.searchRequest.prosopography.splice(i, 1);
                            i--;
                        }
                    }
                },
                onFiltered : function(filteredItems) {
                    // Trigger pagination to update the number of buttons/pages due to filtering
                    this.totalRows = filteredItems.length
                    this.currentPage = 1
                },
                initSearch : async function(){
                  this.searchRequest= {
                      activityMediane: {
                          from: null,
                          to: null,
                      },
                      activity: {
                          start: {
                              from : null,
                              to : null,
                          },
                          end: {
                              from : null,
                              to : null,
                          }
                      },
                      status: [],
                      sexe: [],
                      graph: false,
                      grade: null,
                      discipline: null,
                      name: null,
                      prosopography: [{
                          section: null,
                          subSection: null,
                          operator: "AND",
                          matchType: null,
                          value: null,
                      }]
                  };
                },
                search : async function(){
                    console.log("search");
                    // Booléen pour le chargement des données (animation)
                    this.searching = true;

                    let url = `${apiUrl}/prosopography/search/advanced`;
                    url+="?page="+this.currentPage+"&rows="+this.perPage;
                    const result = await fetch(url,{
                        'method':'POST',
                        'headers':{
                            'Content-Type':'application/json',
                        },
                        'body': JSON.stringify(this.searchRequest),
                    });

                    this.items = await result.json();
                    this.totalCount = result.headers.get('X-Total-Count');
                    this.totalRows = this.items.length;
                    this.nbPage = Math.ceil(this.totalCount / this.perPage);
                    this.searching = false;
                    console.log("search done");

                },
                exportFormat : async function(format){
                    console.log("export format: "+format);
                    // Booléen pour le chargement des données (animation)

                    let url = `${apiUrl}/prosopography/search/advanced?format=`+format;
                    fetch(url,{
                        'method':'POST',
                        'headers':{
                            'Content-Type':'application/json',
                        },
                        'body': JSON.stringify(this.searchRequest),
                    })
                        .then( res => res.blob() )
                        .then( blob => {
                            var url = window.URL.createObjectURL(blob);

                            // Create a new anchor element
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'studium-search';
                            a.click();

                            return a;

                        });
                    console.log("export");
                },

                //FIXME : supprimer les chaines en dur !!!
                // permet d'afficher le json de la requete (prévisu) à l'aide
                // du plugin renderjson
                constructRequest : function () {
                    // pour voir tout les noeuds du JSON on set à all
                    renderjson.set_show_to_level("all");
                    let request = {};
                    let requestAux = {};

                    if (this.searchRequest.name) {
                        request["Nom ou Variante de nom"] = "contient : " +  this.searchRequest.name + ", ";
                    }

                    if (this.searchRequest.activityMediane.from && this.searchRequest.activityMediane.to){
                        request["Médiane d'activité"] = "comprise entre " + this.searchRequest.activityMediane.from + " et " + this.searchRequest.activityMediane.to+ ", ";
                    } else if (this.searchRequest.activityMediane.from && !this.searchRequest.activityMediane.to) {
                        request["Médiane d'activité"] = "est plus grande que " + this.searchRequest.activityMediane.from+ ", ";
                    } else if (this.searchRequest.activityMediane.to && !this.searchRequest.activityMediane.from) {
                        request["Médiane d'activité"] = "est inférieure à " + this.searchRequest.activityMediane.to+ ", ";
                    }

                    if (this.searchRequest.activity.start.from && this.searchRequest.activity.start.to){
                        request["Début de la date d'activité"] = " comprise entre " + this.searchRequest.activity.start.from +" et "+ this.searchRequest.activity.start.to+ ", ";
                    } else if (this.searchRequest.activity.start.from && !this.searchRequest.activity.start.to){
                        request["Début de la date d'activité"] =" plus grand que " + this.searchRequest.activity.start.from+ ", ";
                    } else if (this.searchRequest.activity.start.to && !this.searchRequest.activity.start.from){
                        request["Début de la date d'activité"] = " plus petit que " + this.searchRequest.activity.start.to+ ", ";
                    }

                    if (this.searchRequest.activity.end.to && this.searchRequest.activity.end.from) {
                        request["Fin de la date d'activité"] = " comprise entre " + this.searchRequest.activity.end.from +" et "+ this.searchRequest.activity.end.to+ ", ";
                    } else if (this.searchRequest.activity.end.from && !this.searchRequest.activity.end.to){
                        request["Fin de la date d'activité"]= " plus grand que " + this.searchRequest.activity.end.from+ ", ";
                    } else if (this.searchRequest.activity.end.to && !this.searchRequest.activity.end.from){
                        request["Fin de la date d'activité"] =" plus petit que " + this.searchRequest.activity.end.to+ ", ";
                    }

                    if (this.searchRequest.sexe.length === 1){
                        request["Sexe"] = this.searchRequest.sexe[0];
                    } else if (this.searchRequest.sexe.length > 1) {
                        requestAux["Sexe"] =  this.searchRequest.sexe;
                    }

                    if (this.searchRequest.status.length === 1){
                        request["Status"] = this.searchRequest.status[0];
                    } else if (this.searchRequest.status.length > 1) {
                        requestAux["Status"] =  this.searchRequest.status;
                    }

                    if (this.searchRequest.grade) {
                        request["Grade"] = this.searchRequest.grade;
                    }

                    if (this.searchRequest.discipline){
                        request["Discipline"] = this.searchRequest.discipline;
                    }

                    request = { "et" : request , "ou" : requestAux};
                    requestAux = {};

                    if (this.searchRequest.prosopography.length >= 0){
                        for (let i in this.searchRequest.prosopography){
                            let crit = this.searchRequest.prosopography[i];
                            if (crit.value === null){
                                if (crit.subSection && crit.section){
                                    if (crit.operator === 'OR NOT' || crit.operator === 'AND NOT'){
                                        requestAux[crit.section + " " + crit.subSection] = "n'existe pas";
                                    } else {
                                        requestAux[crit.section + " " + crit.subSection] = "existe";
                                    }
                                } else if (crit.section) {
                                    if (crit.operator === 'OR NOT' || crit.operator === 'AND NOT'){
                                        requestAux[crit.section] = "n'existe pas";
                                    } else {
                                        requestAux[crit.section] = "existe";
                                    }
                                }
                            } else {
                                if (crit.operator === 'OR NOT' || crit.operator === 'AND NOT'){
                                    switch (crit.matchType) {
                                        case "CONTAINS":
                                            requestAux[crit.section + " " + crit.subSection] ="ne contient pas la chaine : " + crit.value;
                                            break;
                                        case "EQUALS":
                                            requestAux[crit.section + " " + crit.subSection] ="n'est pas égal à la chaîne : " + crit.value;
                                            break;
                                        case "END":
                                            requestAux[crit.section + " " + crit.subSection] ="ne se termine pas par la chaîne : " + crit.value;
                                            break;
                                        case "STARTS":
                                            requestAux[crit.section + " " + crit.subSection] ="ne commence pas par la chaîne : " + crit.value;
                                            break;
                                    }
                                } else {
                                    switch (crit.matchType) {
                                        case "CONTAINS":
                                            requestAux[crit.section + " " + crit.subSection] = " contient la chaine : " + crit.value;
                                            break;
                                        case "EQUALS":
                                            requestAux[crit.section + " " + crit.subSection] =" est égal à la chaîne : " + crit.value;
                                            break;
                                        case "END":
                                            requestAux[crit.section + " " + crit.subSection] = " se termine par la chaîne : " + crit.value;
                                            break;
                                        case "STARTS":
                                            requestAux[crit.section + " " + crit.subSection] =" commence par la chaîne : " + crit.value;
                                            break;
                                    }
                                }

                            }

                            switch (crit.operator) {
                                case "OR":
                                case "OR NOT":
                                    request = { "ou" : [ requestAux, request ]};
                                    break;
                                case "AND NOT" :
                                case "AND" :
                                    request = { "et" : [ requestAux , request]};
                                    break;
                            }

                            requestAux = {};
                        }
                    }

                    document.getElementById("test").innerHTML = "";
                    document.getElementById("test").appendChild( renderjson(request));
                    this.vizualisation = true;


                },
                closeRequestVizualisation(){
                    document.getElementById("test").innerHTML = "";
                    this.vizualisation = false;
                }
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
