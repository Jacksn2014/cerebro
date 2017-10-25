angular.module('cerebro').controller('ConnectController', [
  '$scope', '$location', 'ConnectDataService', 'AlertService',
  function($scope, $location, ConnectDataService, AlertService) {

    $scope.hosts = undefined;

    $scope.connecting = false;

    $scope.unauthorized = false;

    $scope.feedback = undefined;

    $scope.setup = function() {
      ConnectDataService.getHosts(
        function(hosts) {
          $scope.hosts = hosts;
        },
        function(error) {
          AlertService.error('Error while fetching list of known hosts', error);
        }
      );
      $scope.host = $location.search().host;
      $scope.unauthorized = $location.search().unauthorized;
    };

    $scope.connect = function(host) {
      if (host) {
        $scope.feedback = undefined;
        $scope.host = host;
        $scope.connecting = true;
        var success = function(data) {
          $scope.connecting = false;
          if (data.status >= 200 && data.status < 300) {
            ConnectDataService.connect(host);
            $location.path('/overview');
          } else {
            if (data.status === 401) {
              $scope.unauthorized = true;
            } else {
              error(data.body);
            }
          }
        };
        var error = function(data) {
          $scope.connecting = false;
          AlertService.error('Error connecting to [' + host + ']', data);
        };
        ConnectDataService.testConnection(host, success, error);
      }
    };

    $scope.authorize = function(host, username, pwd) {
      $scope.feedback = undefined;
      $scope.connecting = true;
      var feedback = function(message) {
        $scope.connecting = false;
        $scope.feedback  = message;
      };
      var success = function(data) {
        switch (data.status) {
          case 401:
            feedback('Invalid username or password');
            break;
          case 200:
            ConnectDataService.connectWithCredentials(host, username, pwd);
            $location.path('/overview');
            break;
          default:
            feedback('Unexpected response stats: [' + data.status + ']');
        }
      };
      var error = function(data) {
        $scope.connecting = false;
        AlertService.error('Error connecting to [' + host + ']', data);
      };
      ConnectDataService.testCredentials(host, username, pwd, success, error);
    };

  }]);
