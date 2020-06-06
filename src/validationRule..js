const validationRule = {
    first_name: {
      required: true,
    },
    last_name: {
      required: true,
    },
    email: {
      required: true,
    },
    password: {
      required: true,
      minLength: 8
    },
    re_password: {
      required: true,
      ref: 'password',
      exactMatch: true
    },
    terms_condition: {
      required: true,
    },
  };
  
  function validate(input, validationRule){
    return Object.keys(validationRule).reduce((errors, key) => {
        
      const currentRule = validationRule[key]
     
      if(currentRule.required) {
        if(!input[key]){
          errors.push(`${key} is required field`)
        }
      }
      
      if(currentRule.minLength) {
        console.log({errors, key, currentRule, input });
        if(input[key] && input[key].length < currentRule.minLength){
          errors.push(`${key} has to more than ${currentRule.minLength} characters`)
        }
      }
      
      //TODO:cross field match validation
      
      return errors
    }, [])
  }
  
  const result = validate({email: 'raja', password: 'qwer'}, validationRule)
  console.log({result});
