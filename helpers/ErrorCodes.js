/**
 * Created by shadygabal on 1/3/16.
 */

var errorCodes = (function() {

    return {
        /* Joining Soiree */
        'SoireeError' : 'SoireeError',
        'UserAlreadyJoinedSoiree' : 'UserAlreadyJoinedSoiree',
        'SoireeFull' : 'SoireeFull',
        'SoireeExpired' : 'SoireeExpired',
        /* Processing Stripe */
        'MissingStripeCustomerId' : 'MissingStripeCustomerId',
        'StripeError' : 'StripeError',
        'StripeCardDeclined' : 'StripeCardDeclined',
        /* Finding soirees */
        'SoireesCannotFindError' : 'SoireesCannotFindError',
        /* User verification */
        'UserVerificationError' : 'UserVerificationError',
        'UserCreationError' : 'UserCreationError',
        /* Misc */
        'MissingData' : 'MissingData',
        'ErrorSaving' : 'MongoError',
        'ErrorPopulating' : 'MongoError',
        'ErrorQuerying' : 'MongoError',
        'MongoError' : 'MongoError',
        'FileReadError' : 'FileReadError',
        'NotFound' : 'NotFound',
        'InvalidInput' : 'InvalidInput',
        'AlreadyExists' : 'AlreadyExists',
        'Error' : 'Error'
    }

}());

module.exports = errorCodes;
