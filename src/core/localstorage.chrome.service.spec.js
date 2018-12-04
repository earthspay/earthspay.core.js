describe('LocalStorage.chrome.Service', function () {
    var chromeStorageService;

    beforeEach(module('earths.core.services'));

    beforeEach(inject(function (_chromeStorageService_) {
        chromeStorageService = _chromeStorageService_;
    }));

    beforeEach(function () {
        window.chrome = {
            storage: {
                sync: {
                    set: function() {},
                    get: function(key, cb) { cb({'EarthsAccounts': 'value'}); }
                },
                local: {
                    set: function() {},
                    get: function(key, cb) { cb({'EarthsAccounts': 'value'}); }
                }
            }
        };

        spyOn(window.chrome.storage.sync, 'set').and.callThrough();
        spyOn(window.chrome.storage.sync, 'get').and.callThrough();
        spyOn(window.chrome.storage.local, 'set').and.callThrough();
        spyOn(window.chrome.storage.local, 'get').and.callThrough();
    });

    afterEach(function () {
        delete window.chrome;
    });

    it('should implement methods', function () {
        expect(chromeStorageService.saveState).toBeDefined();
        expect(chromeStorageService.loadState).toBeDefined();
    });

    it('should save state', function () {
        window.chrome = {
            storage: {
                local: {
                    set: function() {}
                }
            }
        };

        spyOn(window.chrome.storage.local, 'set').and.callThrough();

        //when
        chromeStorageService.saveState('value');
        //then
        expect(window.chrome.storage.local.set).toHaveBeenCalledWith({'EarthsAccounts': 'value'}, jasmine.any(Function));
    });

    it('should get state when sync state is empty', inject(function ($rootScope) {
        window.chrome = {
            storage: {
                sync: {
                    get: function(key, cb) { cb({}); }
                },
                local: {
                    get: function(key, cb) { cb({'EarthsAccounts': 'value'}); }
                }
            }
        };

        spyOn(window.chrome.storage.sync, 'get').and.callThrough();
        spyOn(window.chrome.storage.local, 'get').and.callThrough();

        //when
        var response;
        chromeStorageService.loadState()
            .then(function (data) {
                response = data;
            });
        $rootScope.$digest();
        //then
        expect(window.chrome.storage.sync.get).toHaveBeenCalledWith('EarthsAccounts', jasmine.any(Function));
        expect(window.chrome.storage.local.get).toHaveBeenCalledWith('EarthsAccounts', jasmine.any(Function));
        expect(response).toEqual('value');
    }));

    it('should get state when sync state is not empty', inject(function ($rootScope) {
        var dataObject1 = {'EarthsAccounts': 'value1'};
        var response;

        window.chrome = {
            storage: {
                sync: {
                    get: function(key, cb) { cb(dataObject1); },
                    clear: function(cb) { cb(); }
                },
                local: {
                    set: function(key, cb) { cb(); }
                }
            }
        };

        spyOn(window.chrome.storage.sync, 'get').and.callThrough();
        spyOn(window.chrome.storage.sync, 'clear').and.callThrough();
        spyOn(window.chrome.storage.local, 'set').and.callThrough();

        //when
        chromeStorageService.loadState()
            .then(function (data) {
                response = data;
            });
        $rootScope.$digest();
        //then
        expect(window.chrome.storage.sync.get).toHaveBeenCalledWith('EarthsAccounts', jasmine.any(Function));
        expect(window.chrome.storage.local.set).toHaveBeenCalledWith(dataObject1, jasmine.any(Function));
        expect(window.chrome.storage.sync.clear).toHaveBeenCalled();
        expect(response).toEqual('value1');
    }));
});
