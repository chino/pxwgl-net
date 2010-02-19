var Gamma =
{
	table: [],
	build: function( gamma )
	{
        	if (gamma <= 0){ gamma = 1.0; }

	        var k = 255.0/Math.pow(255.0, 1.0/gamma);

	        for (var i = 0; i <= 255; i++)
        	{
                	Gamma.table[i] = (k*(Math.pow(i, 1.0/gamma)));
	                if( i && !Gamma.table[i] )
				{ Gamma.table[i] = 1 };
        	}
	}
};
Gamma.build(1.0); // build default table that reflects no change
