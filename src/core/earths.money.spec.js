describe('earths.money', function() {

    function earthsTokensToMoney(tokens) {
        return Money.fromTokens(tokens, Currency.EARTHS);
    }

    it('returns the same currency instances for predefined currencies', function () {
        expect(Currency.EARTHS).toBeDefined();

        var c = Currency.create({
            id: Currency.EARTHS.id,
            displayName: Currency.EARTHS.displayName,
            precision: Currency.EARTHS.precision
        });
        expect(c).toBe(Currency.EARTHS);
        expect(Currency.create({id: Currency.BTC.id})).toBe(Currency.BTC);
        expect(Currency.create({id: Currency.UPC.id})).toBe(Currency.UPC);
        expect(Currency.create({id: Currency.USD.id})).toBe(Currency.USD);
        expect(Currency.create({id: Currency.EUR.id})).toBe(Currency.EUR);
        expect(Currency.create({id: Currency.CNY.id})).toBe(Currency.CNY);
    });

    it('converts predefined currency to string', function () {
        expect(Currency.EARTHS.toString()).toEqual('EARTHS');
    });

    it('returns new instance of currency if a client doesn\'t set currency id', function () {
        var c1 = Currency.create({
            displayName: 'one',
            precision: 4
        });

        var c2 = Currency.create({
            displayName: 'one',
            precision: 4
        });

        expect(c1).not.toBe(c2);
        expect(c1.toString()).toEqual('one');
    });

    it('precisely converts tokens to coins', function () {
        expect(new Money(7e-6, Currency.EARTHS).toCoins()).toEqual(700);
        expect(Money.fromCoins(1000, Currency.EARTHS).toTokens()).toEqual(0.00001000);

        var v = 0.00001234;
        expect(Money.fromCoins(earthsTokensToMoney(v).toCoins(), Currency.EARTHS).toTokens()).toEqual(v);

        var stringValue = '0.001222222';
        var m = earthsTokensToMoney(stringValue);
        expect(m.toCoins()).toEqual(122222);
        expect(m.toTokens()).toEqual(0.00122222);
    });

    it('formats money values according to wallet design', function () {
        var m = new Money(88.9841, Currency.EARTHS);
        expect(m.formatAmount()).toEqual('88.98410000');
        expect(m.formatAmount(true)).toEqual('88.9841');
        expect(m.formatIntegerPart()).toEqual('88');
        expect(m.formatFractionPart()).toEqual('.98410000');

        m = Money.fromTokens(12345.456987, Currency.EARTHS);
        expect(m.formatAmount(false, true)).toEqual('12,345.45698700');
        expect(m.formatAmount(false, false)).toEqual('12345.45698700');
        expect(m.formatAmount(true, true)).toEqual('12,345.456987');

        m = Money.fromTokens(9000.005455990000, Currency.BTC);
        expect(m.formatAmount(true, false)).toEqual('9000.00545599');

        m = Money.fromTokens(900.0052567600001, Currency.BTC);
        expect(m.formatAmount(true, false)).toEqual('900.00525676');
    });

    it('strips excess zeros after formatting', function () {
        expect(earthsTokensToMoney(0.001).formatAmount(true)).toEqual('0.001');
        expect(earthsTokensToMoney(0.0001).formatAmount(true)).toEqual('0.0001');
        expect(earthsTokensToMoney(0.00001).formatAmount(true)).toEqual('0.00001');
        expect(earthsTokensToMoney(0.000001).formatAmount(true)).toEqual('0.000001');
        expect(earthsTokensToMoney(0.0000001).formatAmount(true)).toEqual('0.0000001');
        expect(earthsTokensToMoney(0.00000001).formatAmount(true)).toEqual('0.00000001');
    });

    it('compares money values correctly', function () {
        var v1 = earthsTokensToMoney(46.873);
        var v2 = earthsTokensToMoney(59.214);

        expect(v1.lessThan(v2)).toBe(true);
        expect(v1.lessThanOrEqualTo(v2)).toBe(true);
        expect(v2.lessThan(v1)).toBe(false);
        expect(v2.lessThanOrEqualTo(v1)).toBe(false);

        expect(v2.lessThanOrEqualTo(v2)).toBe(true);
        expect(v1.lessThanOrEqualTo(v1)).toBe(true);
        expect(v2.greaterThanOrEqualTo(v2)).toBe(true);
        expect(v1.greaterThanOrEqualTo(v1)).toBe(true);

        expect(v2.greaterThan(v1)).toBe(true);
        expect(v2.greaterThanOrEqualTo(v1)).toBe(true);
        expect(v1.greaterThan(v2)).toBe(false);
        expect(v1.greaterThanOrEqualTo(v2)).toBe(false);
    });

    it('must throw an error when currencies are not the same', function () {
        var earths = earthsTokensToMoney(100);
        var other = Money.fromTokens(10, Currency.BTC);

        expect(function () {earths.greaterThan(other);}).toThrowError();
        expect(function () {earths.greaterThanOrEqualTo(other);}).toThrowError();
        expect(function () {other.lessThan(earths);}).toThrowError();
        expect(function () {other.lessThanOrEqualTo(earths);}).toThrowError();
        expect(function () {other.plus(earths);}).toThrowError();
        expect(function () {earths.minus(other);}).toThrowError();
    });

    it('multiplies money values by a number correctly', function () {
        var value = Money.fromTokens(17, Currency.EARTHS);
        expect(value.multiply(2).toTokens()).toEqual(34);
        expect(value.multiply(0.5).toTokens()).toEqual(8.5);

        expect(function () {value.multiply('12');}).toThrowError();
        expect(function () {value.multiply(NaN);}).toThrowError();
    });
});
