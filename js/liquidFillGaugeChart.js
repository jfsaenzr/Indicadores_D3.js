var dispatch = d3.dispatch('redraw');
let data = [
    {
        "HorasCausadas": 39.10,
        "HorasPactadas": 16.6,
        "Progreso": 2,
        "TiempoDedicado": 38.25,
        "Horas": 12.25,
        "Tipo": "A"
    },
    {
        "HorasCausadas": 19.3,
        "HorasPactadas": 19.3,
        "Progreso": 10,
        "TiempoDedicado": 9.25,
        "Horas": 12.25,
        "Tipo": "B"
    },
    {
        "HorasCausadas": 75.6,
        "HorasPactadas": 26.6,
        "Progreso": 10,
        "TiempoDedicado": 1.25,
        "Horas": 16,
        "Tipo": "C"
    },
    {
        "HorasCausadas": 50.5,
        "HorasPactadas": 7.6,
        "Progreso": 15,
        "TiempoDedicado": 8.25,
        "Horas": 10.95,
        "Tipo": "D"
    },
    {
        "HorasCausadas": 60.10,
        "HorasPactadas": 16.6,
        "Progreso": 2,
        "TiempoDedicado": 38.25,
        "Horas": 12.25,
        "Tipo": "E"
    },
    {
        "HorasCausadas": 85.3,
        "HorasPactadas": 19.3,
        "Progreso": 10,
        "TiempoDedicado": 9.25,
        "Horas": 12.25,
        "Tipo": "F"
    },
    {
        "HorasCausadas": 43.6,
        "HorasPactadas": 26.6,
        "Progreso": 10,
        "TiempoDedicado": 1.25,
        "Horas": 16,
        "Tipo": "G"
    },
    {
        "HorasCausadas": 10.5,
        "HorasPactadas": 7.6,
        "Progreso": 15,
        "TiempoDedicado": 8.25,
        "Horas": 10.95,
        "Tipo": "H"
    }
]

/******************************************************************* */


tipoPie = dc.pieChart('#tipoPie');
GaugePanel1 = liquidGaugeChart('#GaugePanel1');

var xf = crossfilter(data);

data.forEach(function (d) {
    d.medida = 1;
});

var tipoDim = xf.dimension(function (d) { return d.Tipo });
var horasCausadasDim = xf.dimension(function (d) { return d.Tipo });

tipoDimSumGroup = tipoDim.group().reduceSum(function (d) { return +d.medida; });
horasCausadasDimSumGroup = horasCausadasDim.group().reduceSum(function (d) { return +d.HorasCausadas; });

//Grupos falsos
noEmptyHorasCausadasGroup = remove_cero(horasCausadasDimSumGroup);

function remove_cero(source_group) {
    return {
        all: function () {
            return source_group.all().filter(function (d) {
                //console.log(d)
                return d.value != 0;
            });
        }
    };
}


tipoPie
    .width(450)
    .height(300)
    .radius(120)
    .innerRadius(50)
    .dimension(tipoDim)
    .group(tipoDimSumGroup)
    .legend(dc.legend().x(0).y(60).itemHeight(14).gap(5))
    .on('pretransition', function () {
        d3.selectAll("#tipoPie").selectAll("rect").attr("rx", 100);
    })

GaugePanel1
    .dispatch(dispatch)
    .semaforo(true)
    .group(noEmptyHorasCausadasGroup)

//*********** render *********** */

tipoPie
    .on("filtered", my_func)
    .render();

GaugePanel1
    .render()

dc.redrawAll();
dispatch.call("redraw");

function my_func() {

    dc.redrawAll();
    dispatch.call("redraw");

}

/******************************************************************* */