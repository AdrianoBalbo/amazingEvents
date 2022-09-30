const index = document.getElementById('index');
const pastEventPage = document.getElementById('pastEvents');
const upcomingEventsPage = document.getElementById('upcomingEvents');


const queryString = location.search;
const params = new URLSearchParams(queryString);
const id = params.get("id");

const { createApp } = Vue

createApp({
    data() {
        return {
            eventos: [],
            checkCategory: [],
            fechaActual: [],
            eventosFuturos: [],
            eventosPasados: [],
            inputTexto: '',
            eventosFiltrados: [],
            checkBoxesSeleccionados: [],
            eventoId: {},
            eventoMasCapacidad: [],
            eventoMayorAsistencia: [],
            eventoMenorAsistencia: [],
            ganancia:[],
            porcentajeDeAsistencia:[],
            statsPorCategoriaPast: [],
            statsPorCategoriaUp: [],
        }
    },
    created() {
        fetch("https://amazing-events.herokuapp.com/api/events")
            .then((Response) => Response.json())
            .then((json) => {
                this.eventos = json.events
                this.eventosFiltrados = this.eventos
                this.fechaActual = json.currentDate

                this.conseguirAsistencias(this.eventos.filter(e => e.date < this.fechaActual))

                this.tablasPorCategorias(this.eventos.filter(evento => evento.date > this.fechaActual), this.statsPorCategoriaUp)
                this.tablasPorCategorias(this.eventos.filter(evento => evento.date < this.fechaActual), this.statsPorCategoriaPast)


                console.log(this.revenues)
                this.conseguirMayorCapacidad()
                this.crearCheck()
                this.filtroUpcoming()
                this.filtroPast()
                this.eventoId = this.eventos.find(evento => evento._id == id)
                if (pastEventPage) {
                    this.eventos = this.eventos.filter(evento => evento.date < this.fechaActual)
                }
                if (upcomingEventsPage) {
                    this.eventos = this.eventos.filter(evento => evento.date > this.fechaActual)
                }
            })
            .catch((error) => console.log(error))

    },
    mounted() {

    },
    methods: {
        crearCheck() {
            this.eventos.forEach(event => {
                if (!this.checkCategory.includes(event.category)) {
                    this.checkCategory.push(event.category);
                }
            })
        },
        filtroUpcoming() {
            this.eventosFuturos = this.eventos.filter(e => e.date > this.fechaActual)
        },
        filtroPast() {
            this.eventosPasados = this.eventos.filter(e => e.date < this.fechaActual)
        },
        filtroInputTexto(arrayDeEventos) {
            this.eventosFiltrados = arrayDeEventos.filter(evento => evento.description.toLowerCase().includes(this.inputTexto.toLowerCase()) || evento.name.toLowerCase().includes(this.inputTexto.toLowerCase()))
        },
        conseguirMayorCapacidad() {
            let capacidad = this.eventos.map(event => event.capacity)
            this.eventoMasCapacidad = this.eventos.find(event => event.capacity == Math.max(...capacidad))
        },


        conseguirAsistencias(eventosPasados) {
            let asistencia = eventosPasados.map(event => event.assistance / event.capacity)

            this.eventoMayorAsistencia = eventosPasados.find(event => event.assistance / event.capacity == Math.max(...asistencia))

            this.eventoMenorAsistencia = eventosPasados.find(event => event.assistance / event.capacity == Math.min(...asistencia))
        },

        tablasPorCategorias(eventosPorFecha, arrayDeGuardado) {
            let categoriasAuxiliares = []
            eventosPorFecha.forEach(evento => {
                if (!categoriasAuxiliares.includes(evento.category)) {
                    categoriasAuxiliares.push(evento.category)
                }
            })

            //_________________________________________________

            categoriasAuxiliares.forEach(categoria => {
                let estimados = []
                let capacidad = []
                let arrayDeGanancias = []

                eventosPorFecha.forEach(evento => {
                    if (evento.category == categoria) {
                        estimados.push(evento.estimate ?? evento.assistance)
                        capacidad.push(evento.capacity)
                        arrayDeGanancias.push(evento.price * Number(evento.estimate ?? evento.assistance))
                    }
                })
                this.ganancia.push(arrayDeGanancias.reduce((a, b) => a + b))
                this.porcentajeDeAsistencia.push(Math.round((estimados.map(i => Number(i)).reduce((a, b) => a + b)) * 100 / (capacidad.map(i => Number(i)).reduce((a, b) => a + b))))

                arrayDeGuardado.push([categoria, (arrayDeGanancias.reduce((a, b) => a + b)), (Math.round((estimados.map(i => Number(i)).reduce((a, b) => a + b)) * 100 / (capacidad.map(i => Number(i)).reduce((a, b) => a + b))))])
            })
        },




    },

    computed: {
        dobleFiltro() {
            if (this.checkBoxesSeleccionados.length != 0) {
                this.eventosFiltrados = this.eventos.filter(evento => {
                    return this.checkBoxesSeleccionados.includes(evento.category)
                })
            } else {
                this.eventosFiltrados = this.eventos
            }
            if (this.inputTexto != '') {
                this.filtroInputTexto(this.eventosFiltrados)
            }
        }
    },
}).mount('#app')



