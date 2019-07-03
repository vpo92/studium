
const disciplines = [
    {code:"ALL",label:"Tous"},
    {code:"ART",label:"Art"},
    {code:"DROIT",label:"Droit"},
    {code:"DROIT_CANON",label:"Droit canon"},
    {code:"DROIT_CIVIL",label:"Droit civil"},
    {code:"MEDECINE",label:"Médecine"},
    {code:"MUSIQUE",label:"Musique"},
];

const grades = [
    {code:"ALL",label:"Tous"},
    {code:"MAGIS",label:"Magister"},
    {code:"DR",label:"Docteur"},
    {code:"MAITRE",label:"Maître"},
    {code:"LIC",label:"Licencié"},
    {code:"BAC",label:"Bachelier"},
    {code:"ETU",label:"Étudiant"},
];

const status = [
    {code:"ALL",label:"Tous"},
    {code:"MAITRE",label:"Maître"},
    {code:"GRADUE",label:"Gradué"},
    {code:"ETU",label:"Étudiant"},
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
    {code: 'EQUALS',label: 'égale à'}
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
        return {
            code: item,
            label: item,
        };
    });
}

const getSubChapter = (chapter) => {
    return Object.keys(chapter).map( item => {
        //const k = localeData.fr[chapter[item]];
        const k = chapter[item];
        return {
            code: k,
            label: k,
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
            selectedOperator:null,
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
                        <option v-for="option in operatorList" v-bind:value="option.code" >{{ option.label }}</option>
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
                <td><a class="btn btn-primary" :href="'.'+record.link">voir la fiche</a></td>
            </tr>`
})


var app = new Vue({
    el: '#app',
    data: {
        apiUrl: "http://localhost:3000",
        searchRequest: {
            activityMediane: {
                from: null,
                to: null,
            },
            activity: {
                from: null,
                to: null,
            },
            status: null,
            grade: null,
            discipline: null,
            prosopography: [{
                section: null,
                subSection: null,
                operator: null,
                matchType: null,
                value: null,
            }]
        },

        statusList:status,
        disciplineList:disciplines,
        gradeList:grades,
        results: null,
        dataTable: null,

    },
    methods: {
        handleChapterChange : function(){
            this.subChapterList = getSubChapter(prosopographyEntries[this.searchRequest.prosopography.section]);
        },
        handleAddProsopographyRow: function(){
            this.searchRequest.prosopography.push({
                section: null,
                    subSection: null,
                    operator: null,
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
        search: async function(){

            const result = await fetch(`${this.apiUrl}/prosopography/search/advanced`,{
                'method':'POST',
                'headers':{
                    'Content-Type':'application/json',
                },
                'body': JSON.stringify(this.searchRequest),
            });
            this.results = await result.json();
        }
    },
    // mounted() {
    //     let users = [];
    //
    //     this.dataTable = $('#resultTable').DataTable({});
    // }
});
