// @flow

import { addActivityMediane, addExtraData } from '../../src/rawFilesParser/util/extradata';

describe('Extra Data Module', () => {

  // addActivityMediane
  describe('addActivityMediane', () => {
    it('should return null when no proso is provided', () => {
      // given
      const proso = null;
      // when
      const mediane = addActivityMediane(proso);
      // then
      expect(mediane).toEqual(null);
    });
    it('should return {} when proso is empty', () => {
      // given
      const proso = {};
      // when
      const mediane = addActivityMediane(proso);
      // then
      expect(mediane).toEqual({});
    });
    it('should return 1405 when date INTERVAL is provided', () => {
      // given
      const proso = {
        "identity" : {
          "datesOfActivity" : [
            {
                "value" : "%1403-1403%",
                "meta" : {
                    "dates" : [
                        {
                            "type" : "INTERVAL",
                            "startDate" : {
                                "type" : "SIMPLE",
                                "date" : 1400
                            },
                            "endDate" : {
                                "type" : "SIMPLE",
                                "date" : 1410
                            }
                        }
                    ]
                }
            }
        ]
        }};
      // when
      const res = addActivityMediane(proso);
      // then
      expect(res.extras.activityMediane).toEqual(1405);
    });
    it('should return startDate when AFTER date is provided', () => {
      // given
      const proso = {
        "identity" : {
          "datesOfActivity" : [
            {
                "value" : "1400:",
                "meta" : {
                    "dates" : [
                        {
                            "type" : "AFTER",
                            "date" : 1400,
                        }
                    ]
                }
            }
        ]
        }};
      // when
      const res = addActivityMediane(proso);
      // then
      expect(res.extras.activityMediane).toEqual(1400);
    });
    it('should return startDate when BEFORE date is provided', () => {
      // given
      const proso = {
        "identity" : {
          "datesOfActivity" : [
            {
                "value" : ":1403",
                "meta" : {
                    "dates" : [
                        {
                            "type" : "BEFORE",
                            "date" : 1403,
                        }
                    ]
                }
            }
        ]
        }};
      // when
      const res = addActivityMediane(proso);
      // then
      expect(res.extras.activityMediane).toEqual(1403);
    });
  });

  describe('addExtraData', () => {
    it('should return null when no proso is provided', () => {
      const res = addExtraData(null, [addActivityMediane]);
      // then
      expect(res).toEqual(null);
    });
    it('should return p when no extra is provided', () => {
      // given
      const proso = {reference:"12345"};
      // when
      const res = addExtraData(proso, []);
      // then
      expect(res).toEqual(proso);
    });
    it('should return p when null extra is provided', () => {
      // given
      const proso = {reference:"12345"};
      // when
      const res = addExtraData(proso, null);
      // then
      expect(res).toEqual(proso);
    });
    it('should return work when addActivityMediane extra is provided', () => {
      // given
      const proso = {
        "identity" : {
          "datesOfActivity" : [
            {
                "value" : ":1403",
                "meta" : {
                    "dates" : [
                        {
                            "type" : "BEFORE",
                            "date" : 1403,
                        }
                    ]
                }
            }
        ]
        }};
      // when
      const res = addExtraData(proso, [addActivityMediane]);
      // then
      expect(res.extras.activityMediane).toEqual(1403);
    });

  });

});
