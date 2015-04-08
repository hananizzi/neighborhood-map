$( document ).ready(  function(){

            //loads neighborhood - Manhattan. I used http://www.latlong.net/ to determine latitude and longitude.
            var map = new google.maps.Map(document.getElementById('map-canvas'), {center: new google.maps.LatLng(40.754931,-73.984019),zoom: 12 });
                 
            var favePlaces = [
                  {   
                        latLng : new google.maps.LatLng(40.764139 , -73.970336), 
                        title : "Philippe Chow",
                        keys : [ 'chinese', 'dinner', 'asian']
                  }, 
                  {   
                        latLng : new google.maps.LatLng(40.743224, -73.992557), 
                        title : "Hill Country Barbecue Market", 
                        keys : [ 'american', 'lunch', 'dinner']
                  },
                  {
                        
                        latLng : new google.maps.LatLng(40.767405, -73.981057),
                        title : "Marea",
                        keys : [ 'greek', 'dinner']
                  },
                  {
                        
                        latLng : new google.maps.LatLng(40.765670, -73.987349),
                        title : "Totto Ramen", 
                        keys : [ 'ramen', 'japanese', 'lunch']
                  },
                  {
                        
                        latLng : new google.maps.LatLng(40.764761, -73.982249),
                        title : "Serafina Broadway", 
                        keys : [ 'italian', 'dinner']
                  }, 
                  {
                        latLng : new google.maps.LatLng(40.757239, -73.976659),
                        title : "Smith & Wollensky", 
                        keys : [ 'steakhouse','steak','american','dinner']

                  }
                  
            ];
     
            function DecoratedMarker( marker_info, mvm ){
                  var self = this;

                  
                  self.mvm = mvm;
                  self.title = marker_info.title;
                  

                  self.bubbleText  = ko.observable( marker_info.title);

                  self.keys = marker_info.keys;
                  // take the bubbe text and the title and split them into words and add them to the list of keys
                  // so that the search will include that text as well
                  var bubbleParts = self.bubbleText().split( " ");
                  for( var i = 0 ; i < bubbleParts.length; i++ ) self.keys.push( bubbleParts[i].toLowerCase() );
                  var titleParts = self.title.split( " " );
                  for( i = 0; i < titleParts.length; i++ ) self.keys.push( titleParts[i].toLowerCase());
                  

                  self.infowindow = new google.maps.InfoWindow( { content : self.bubbleText() });

                  self.mapMarker = new google.maps.Marker({ position: marker_info.latLng,map: map,title: marker_info.title }); 


                  // This function is called when one of the markers on the map is clicked
                  google.maps.event.addListener( self.mapMarker , 'click',  function(){  
                        self.selected();
                  }); 

                  // This function is called when one of the list items is clicked from list view
                  self.selected = function(){  
                        // close any other bubble, and unselect any other label   
                        mvm.closeAll();
                        self.clicked();               

                        
                  };


                  self.matches = function( q ){
                        // see if query 'q' appears in the keys
                        return $.inArray( q.toLowerCase(), self.keys ) != -1;
                  };


                        
                  /*
                         The states are the following
                        1) initial map load. All labels are visible and unselected. All markers are visible and their baloon is up
                        2) marker clicked. Only that label will have 'selected' css class and the bubble is visible, also the 4square should be up.
                        3) matches a search, same as 2) above but w/o the 4square ( currently is coming off the list view which is odd )
                        4) does not match a search result, label and marker are not visible.
                  */

                  // this var is used to control the css class for the list item
                  self.isSelected = ko.observable( false );

                  self.initialState = function(){
                        self.isSelected( false );
                        self.mapMarker.setVisible( true );
                        self.infowindow.close();
                        $('#four-square-view').css( 'display', 'none'); 
                  };

                  self.clicked = function(){
                        self.isSelected( true );
                        self.mapMarker.setVisible( true );
                        self.infowindow.open( map,self.mapMarker );
                  };

                  self.matchesSearch = function(){
                        self.isSelected( true );
                        self.mapMarker.setVisible( true );
                        self.infowindow.open( map,self.mapMarker );
                        $('#four-square-view').css( 'display', 'none'); 
                  };

                  self.doesNotMatch = function(){ 
                        self.isSelected( false );
                        self.mapMarker.setVisible( false );
                        self.infowindow.close();
                        $('#four-square-view').css( 'display', 'none'); 
                  };


            }

            function MarkerViewModel(){
                  var self = this;

                  var tmpArray = [];
                  for( var i = 0; i < favePlaces.length; i++ ) tmpArray.push( new DecoratedMarker( favePlaces[i], self) );      
                  self.markers = ko.observableArray( tmpArray );





                  self.fourName = ko.observable('inital');
                  self.fourRating = ko.observable( 'initial');
                  self.searchQ = ko.observable( '' );


                  self.closeAll = function( ){ for( var i = 0; i < self.markers().length; i++ ) self.markers()[i].initialState(); };
                  self.searchMarkers = function(){

                        var q = self.searchQ();

                        // find a list of markers that match this string
                        var filterList = [];
                        var noMatchList = [];
                        for( var i = 0; i < self.markers().length; i++ ){
                              var m = self.markers()[i];
                              if( m.matches( q ))
                                    filterList.push( m );
                              else 
                                    noMatchList.push( m);
                        }

                        for(  i = 0; i < filterList.length; i++ )filterList[i].matchesSearch();
                        for(  i = 0; i < noMatchList.length; i++ )noMatchList[i].doesNotMatch();


                  };

                  self.selectItem = function( item ){
                        item.selected();
                  };


                  self.clearSearch = function(){
                        self.searchQ("");
                        for(  i = 0; i < self.markers().length; i++ ) self.markers()[i].initialState();
                  };
            }
            
        ko.applyBindings( new MarkerViewModel() );

      });