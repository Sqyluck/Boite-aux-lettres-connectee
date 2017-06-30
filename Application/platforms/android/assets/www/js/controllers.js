angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope, $timeout) {
    $scope.hideCollecter = true;
    var collect = function(){
        $rootScope.constellation.registerStateObjectLink("*", "Brain", "UserCollect", "*", function(so){
            if($rootScope.nbNotifs != 0){
                $scope.UserCollect = so.Value;
                if(so.Value == ""){
                    $scope.hideCollecter = true;
                }else{
                    $scope.hideCollecter = false;
                }
            }
        });
        $timeout(collect, 500);
    };
    $timeout(collect, 500);
})

.controller('ChatsCtrl', function($scope, $rootScope, $timeout) {
    /*$scope.$watch(function(){
        console.log("apply : " + $rootScope.newUserExpired);
        if(($rootScope.newUserExpired)||($rootScope.newUserID =="")){
            console.log("new user expired");
            $scope.hideNewUser = true;
        }else{
            console.log("new user still there");
            $scope.hideNewUser = false;
        }
    });*/
    var maj = function(){
        $rootScope.constellation.registerStateObjectLink("*", "Brain", "newUser", "*", function(so){
            if( (so.IsExpired)||(so.Value == "") ){
                $scope.hideNewUser = true;
            }else{
                $scope.hideNewUser = false;
            }
        });
        $timeout(maj, 1000);
    };
    $timeout(maj);
})

.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicPopup, $rootScope, $state) {
  $scope.name = $stateParams.name
  $scope.firstName = $stateParams.firstName;
  $scope.deleteUser = function() {
      var deleteUser = $ionicPopup.confirm({
        title: 'Supprimer cet utilisateur',
        template: 'Etes vous sur de vouloir supprimer cet utilisateur ?'
      });
      deleteUser.then(function(res) {
        if(res) {
            $rootScope.constellation.sendMessage({ Scope: 'Package', Args: ['Brain'] }, 'DeleteUser', [$scope.firstName, $scope.name ]);
            $state.go('tab.utilisateurs');
            console.log('deleted');
        } else {
            console.log('do nothing');
        }
      });
  };
})

.controller('AjoutCtrl', function($scope, $rootScope, $state) {
    $scope.add = function(){
        console.log("add");
        /*if(($rootScope.newUserID=="")||($rootScope.newUserExpired)){
            console.log("aucun badge enregistré");
                return;
        }*/
        $rootScope.constellation.sendMessageWithSaga({ Scope: 'Package', Args: ['Brain'] }, 'AddUser', [ $rootScope.newUserID, $("#type:checked").val(), $('#firstname').val(), $('#name').val() ],
        function(response) {
            switch (response.Data) {
                case 1:
                    console.log("added");
                    $state.go('tab.utilisateurs');
                    break;
                case 2:
                    console.log("remplis tous les champs");
                    break;
                case 4:
                    console.log("badge already used");
                    break;
                default:
                    console.log("already exists");
            }
        });
    };
})

.controller('AccountCtrl', function($scope, $rootScope, $ionicPopup, $timeout) {


  $scope.showConfirm = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Supprimer tous les utilisateurs',
        template: 'Etes vous sur de vouloir supprimer tous les utilisateurs ?'
      });
      confirmPopup.then(function(res) {
        if(res) {
            $rootScope.constellation.sendMessage({ Scope: 'Package', Args: ['Brain'] }, 'deleteAllUsers', {});
          console.log('deleted');
        } else {
          console.log('do nothing');
        }
      });
    };
	    var maj = function(){
            if($rootScope.doorOpened){
                $scope.hideDoor = true;
            }
			else{
                $scope.hideDoor = false;
            }

			if ($rootScope.isConnected) {
				$scope.hideConnected = true;
			}
			else{
				$scope.hideConnected = false;
			}


        $timeout(maj, 1000);
    };
    $timeout(maj);
});
