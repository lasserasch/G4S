(function($jq) {
    if ($jq.validator.unobtrusive.adapters["ischecked"] === undefined) {
        $jq.validator.unobtrusive.adapters.addBool("ischecked", "required");
    }

    $jq.validator.addMethod(
        "daterange",
        function(value, element, params) {
            return this.optional(element) || (value >= params.min && value <= params.max);
        });

    if ($jq.validator.unobtrusive.adapters["daterange"] === undefined) {
        $jq.validator.unobtrusive.adapters.add(
            "daterange",
            ["min", "max"],
            function(options) {
                var params = {
                    min: options.params.min,
                    max: options.params.max
                };
                options.rules["daterange"] = params;
                options.messages["daterange"] = options.message;
            });
    }
})(jQuery);