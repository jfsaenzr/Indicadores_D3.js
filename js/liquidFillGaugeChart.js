var dispatch = d3.dispatch('redraw');
let data = [
    { 'nombre': 'Indicador A', 'medida': 98 },
    { 'nombre': 'Indicador B', 'medida': 45 },
    { 'nombre': 'Indicador C', 'medida': 60 },
    { 'nombre': 'Indicador D', 'medida': 8 },
    { 'nombre': 'Indicador E', 'medida': 98 },
    { 'nombre': 'Indicador F', 'medida': 73 },
    { 'nombre': 'Indicador G', 'medida': 50 },
    { 'nombre': 'Indicador H', 'medida': 12 },
    { 'nombre': 'Indicador I', 'medida': 85 },
    { 'nombre': 'Indicador J', 'medida': 18 },
]

/******************************************************************* */


tipoPie = dc.pieChart('#tipoPie');
GaugePanel1 = liquidGaugeChart('#GaugePanel1');

var xf = crossfilter(data);

data.forEach(function (d) {
    //d.medida = 1;
});

var tipoDim = xf.dimension(function (d) { return d.nombre });
var horasCausadasDim = xf.dimension(function (d) { return d.nombre });

tipoDimSumGroup = tipoDim.group().reduceSum(function (d) { return +d.medida; });
horasCausadasDimSumGroup = horasCausadasDim.group().reduceSum(function (d) { return +d.medida; });

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
