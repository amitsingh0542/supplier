app.controller('dashboardCtrl', function ($scope, $rootScope, $routeParams, $location, $http, Data) { 
	console.log("test1");
    Data.get('tps_dashboard').then(function (results) {
    	$scope.tpsDashboard = results
    });

    $scope.deleteSupplier = function(id){
        Data.post('supplierDelete', {supplier: {id: id}}).then(function (results) {
            Data.toast(results);
            Data.get('tps_dashboard').then(function (results) {
                $scope.tpsDashboard = results
                console.log(results);
            });
        });

    }
});