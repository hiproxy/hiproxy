/**
 * @file
 * @author zdying
 */

module.exports = Sequence;

function Sequence(){
    this.seqs = {
        _default: []   
    };
    this.context = {};
}

Sequence.prototype = {
    constructor: Sequence,

    use: function(filter/*, fn1, fn2, fn3, ...*/){
        var start = 0;
        var fns = [].slice.apply(arguments);
        var seqs = this.seqs;
        var target = seqs._default;
        var filterType = typeof filter;
        var _filter = filter;

        if(filterType === 'string'/* || filter instanceof RegExp*/){
            fns = fns.slice(1);
            target = seqs[filter] || (seqs[filter] = []);
        }else if(filterType === 'function'){
            // _filter = '';
        }
        
        fns.forEach(function(fn){
            if(typeof fn === 'function'){
                // fn.__filter__ = _filter;
                target.push(fn);
            }
        });
    },

    next: function(filter, err, data){
        var curr = this.seqs[filter][++this.__index__];

        if(err){
            this.catch(SyntaxErrorConstructor);
        }else{
            curr(this.context, this.next.bind(this, filter))
        }
    },

    catch: function(err){
        
    },

    run: function(filter, context, index){
        if(typeof filter === 'object' && filter !== null){
            index = context;
            context = filter;
            filter = '_default';
        }

        var seqs = this.seqs[filter];

        if(Array.isArray(seqs)){
            index = index || 0;
            context = context || {};

            this.__index__ = index;
            this.context = context;

            if(typeof seqs[index] === 'function'){
                seqs[index](context, this.next.bind(this, filter));
            }
        }
    }
}
