/**
 * TableUtil
 * Provide quick search + filters to ur tables
 *
 * <!> Please follow the html5 table structure <!>
 * table
 *
 *   thead --> filter / heading row
 *     tr --> filter / heading row
 *       th --> each filter / heading
 *
 *   tbody --> elements container
 *     tr --> each element
 *       td --> each element prop
 *
 */
export default class TableUtil{

    constructor(config){
        if(!document.body) {
            document.addEventListener('DOMContentLoaded', ()=> this.init(config))
        }else{
            this.init(config)
        }
    }

    init(config){

        this.config = Object.assign({

            table: document.getElementsByTagName('table')[0],

            activeClass: 'table-search-active',
            filterClass: 'table-search-filter',
            activeFilterClass: 'table-search-filter-active',
            reversedFilterClass: 'table-search-filter-reversed',

            // true will take all table th
            // u can also provide a class name if u want
            filters: true,
            // sort attribute can be used in order to replace the default value used for sorting (default: element.innerText)
            sortAttribute: "data-sort",

            noResultText: "<em>Aucuns résultats</em>"

        }, config)
        this.build( this.config.element || this.config.table )
        this.bind()
    }

    build(el){
        this.table = el;
        this.tbody = this.table.getElementsByTagName('tbody')[0]
        this.els = [].slice.call(this.tbody.children)

        this.search = document.createElement('input')
        this.search.className = "table-search"
        this.search.placeholder = 'Rechercher...'
        this.table.parentElement.insertBefore(this.search, this.table)

        this.noResultRow = document.createElement('tr')
        this.noResultRow.className = "no-results hidden"
        this.tbody.appendChild(this.noResultRow)
        this.noResultRow.innerHTML = this.config.noResultText

        if( this.config.filters ){

            let defaultFilters = [].slice.call( this.table.getElementsByTagName('th') )
            if( this.config.filters === true) this.filters = defaultFilters
            else {
                this.filters = [].slice.call( this.table.getElementsByClassName(this.config.filters) )
            }

            // set filters index
            defaultFilters.map((df, i)=>{
                this.filters.map((f)=>{
                    if(f == df) f.index = i;
                })
            })

            this.filters.map((filter)=>{
                filter.classList.add(this.config.filterClass)
            })

        }

    }

    bind(){
        this.search.addEventListener('keyup', ()=>{
            this.hideEls(this.els)
            this.searchEls(this.search.value)
        })


        this.filters.map((filter)=>{
            filter.addEventListener('click', ()=>{

                this.cleanFilters()

                if( this.activeFilter == filter.index ) filter.classList.add(this.config.reversedFilterClass)
                filter.classList.add(this.config.activeFilterClass)

                this.sort(filter.index, (this.activeFilter == filter.index))

            })
        })
    }

    refreshEls(){
        this.clearEls()
        this.appendEls()
    }
    appendEls(){
        this.els.map((el)=>{
            this.tbody.appendChild(el)
        })
    }
    clearEls(){
        this.tbody.innerHTML = ''
    }
    hideEls(){
        this.cleanEls()
        this.els.map(el => el.classList.add('hidden') )
    }
    searchEls(value){

        value = value.toUpperCase()
        let noResults = true

        this.els.map( el => {

            let content = '-' + el.innerText.toUpperCase() + '-'
            if( content.split(value).length > 1 ) {

                noResults = false
                el.classList.remove('hidden')

                if(value.length && el.children.length){
                    let children = [].slice.call(el.children)
                    children.map((child)=>{
                        let content = '-' + child.innerText.toUpperCase() + '-'
                        if( content.split(value).length > 1 ){
                            child.classList.add( this.config.activeClass )
                        }
                    })
                }
            }
        })

        if ( noResults ) this.noResultRow.classList.remove('hidden')
        else this.noResultRow.classList.add('hidden')
    }

    cleanEls(){
        let els = document.getElementsByClassName(this.config.activeClass)
        if(els.length){
            [].slice.call(els).map((el)=>{
                el.classList.remove(this.config.activeClass)
            })
        }
    }
    cleanFilters(){
        this.filters.map((filter)=>{
            filter.classList.remove(this.config.activeFilterClass)
            filter.classList.remove(this.config.reversedFilterClass)
        })
    }

    sort(i, isReverse){
        this.activeFilter = isReverse ? -1 : i;
        let factor = 1
        if(isReverse) factor = -1

        this.els.sort((a, b)=>{
            let asort = a.children[i].getAttribute(this.config.sortAttribute) || a.children[i].innerText
            let bsort = b.children[i].getAttribute(this.config.sortAttribute) || b.children[i].innerText
            if( asort > bsort ) return factor;
            else if( asort < bsort ) return -factor;
            return 0;
        })

        this.refreshEls()
    }
}
