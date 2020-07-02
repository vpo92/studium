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
    {code: 'NOT',label: 'différent de'}
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
    template: `<div class="form-inline">
        <div class="form-group">
            <select v-model="prosopography.operator">
                <option v-for="option in operatorList" v-bind:value="option.code" selected="selected">{{ option.label }}</option>
            </select>
        </div>
        <div class="form-group">
            <select v-model="prosopography.section" @change="handleChapterChange()">
                <option v-for="option in chapterList" v-bind:value="option.code" >{{ option.label }}</option>
            </select>
        </div>
        <div class="form-group">
            <select v-model="prosopography.subSection">
                <option v-for="option in subChapterList" v-bind:value="option.code" >{{ option.label }}</option>
            </select>
        </div>
        <div class="form-group">
            <select v-model="prosopography.matchType">
                <option v-for="option in searchOptionList" v-bind:value="option.code" >{{ option.label }}</option>
            </select>
        </div>
        <div class="form-group">
            <input type="text" v-model="prosopography.value">
        </div>
        <div>
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

        new Vue({
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
                results: [],
                rows: [],
                dataTable: null,

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
                searchs: async function(){

                    if (this.checkFields()){
                        alert("Autant telecharger la BDD");
                        return;
                    }

                    this.searching = true;
                    this.dataTable = $('#resultTable2').DataTable();
                    this.dataTable.destroy();

                    const result = await fetch(`${apiUrl}/prosopography/search/advanced`,{
                        'method':'POST',
                        'headers':{
                            'Content-Type':'application/json',
                        },
                        'body': JSON.stringify(this.searchRequest),
                    });

                    this.results = await result.json()


                    this.searching = false;

                    this.$nextTick(function () {
                        this.dataTable = $("#resultTable2").DataTable({
                            dom: 'Bfrtip',
                            buttons: buttons,
                            language: lang,
                        });
                    });



                    console.log(this.results);
                },
                checkFields: function () {

                    let empty = true;

                    console.log(this.searchRequest);

                    if (this.searchRequest.name==null && this.searchRequest.activityMediane.to==null &&
                        this.searchRequest.activityMediane.from==null && this.searchRequest.grade==null &&
                        this.searchRequest.activity.start.from==null && this.searchRequest.activity.start.to ==null
                        && this.searchRequest.discipline==null && this.searchRequest.activity.end.from==null &&
                        this.searchRequest.status.length===0 && this.searchRequest.activity.end.to==null &&
                        this.searchRequest.sexe.length===0){
                        for (let i in this.searchRequest.prosopography) {
                            let prosec = this.searchRequest.prosopography[i];
                            if (prosec.section != null){
                                empty = false;
                            }
                        }
                        } else {
                        empty = false
                    }
                    return empty;
                },

            },
            mounted : function () {


            }
        })
    });

