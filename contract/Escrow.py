import smartpy as sp
import uuid


class Escrow(sp.Contract):
    def __init__(self, master):

        self.init(
            master=master,
            parties=sp.big_map(
                tkey=sp.TString,
                tvalue=sp.TRecord(
                    owner=sp.TOption(sp.TAddress),
                    counterparty=sp.TOption(sp.TAddress),
                ),
            ),
            transactions=sp.big_map(
                tkey=sp.TString,
                tvalue=sp.TRecord(
                    offer=sp.TMutez,
                    fee=sp.TMutez,
                    balanceOwner=sp.TMutez,
                    balanceCounterparty=sp.TMutez,
                    epoch=sp.TTimestamp,
                    duration=sp.TNat,
                    hashedSecret=sp.TOption(sp.TBytes),
                    ownerHasWithdrawn=sp.TBool,
                    counterpartyHasWithdrawn=sp.TBool,
                    description=sp.TString,
                    title=sp.TString,
                    status=sp.TInt,
                ),
            ),
        )

    @sp.entry_point
    def resetEscrow(self):
        sp.verify(self.data.master == sp.sender, "Only the admin can reset!")
        self.data.transactions = sp.big_map({})
        self.data.parties = sp.big_map({})

    def initTransaction(self, transactionId, offer=sp.mutez(0), fee=sp.mutez(0), duration=sp.nat(0), epoch=sp.timestamp(0), secret=sp.string("secret_key"), description=sp.string("description"), title=sp.string("title")):
        self.data.transactions[transactionId] = sp.record(
            offer=offer,
            fee=fee,
            balanceOwner=sp.mutez(0),
            balanceCounterparty=sp.mutez(0),
            epoch=epoch,
            duration=duration,
            hashedSecret=sp.some(sp.blake2b(sp.pack(secret))),
            ownerHasWithdrawn=sp.bool(False),
            counterpartyHasWithdrawn=sp.bool(False),
            description=description,
            title=title,
            status=sp.int(0),
        )

    ### main admin interfaces ###

    @sp.entry_point
    def createCommission(self, transactionId=sp.none):
        sp.verify(self.data.master == sp.sender,
                  "Only the admin can create a transaction!")

        with sp.if_(transactionId == sp.none):
            newTransaction = str(uuid.uuid4())
            self.initTransaction(newTransaction)
            self.data.parties[newTransaction] = sp.record(
                owner=sp.none,
                counterparty=sp.none,
            )
        with sp.else_():
            self.initTransaction(transactionId.open_some())
            self.data.parties[transactionId.open_some()] = sp.record(
                owner=sp.none,
                counterparty=sp.none,
            )

    @sp.entry_point
    def postCommission(self, offer, fee, duration, secret, description, title, transactionId=sp.none):

        sp.set_type(offer, sp.TMutez)
        sp.set_type(fee, sp.TMutez)
        sp.set_type(duration, sp.TNat)
        sp.set_type(secret, sp.TString)
        sp.set_type(description, sp.TString)
        sp.set_type(title, sp.TString)

        with sp.if_(transactionId == sp.none):
            newTransactionId = str(uuid.uuid4())
            self.initTransaction(newTransactionId, offer=offer,
                                 fee=fee, secret=secret, description=description, title=title)
            self.data.parties[newTransactionId] = sp.record(
                owner=sp.some(sp.sender),
                counterparty=sp.none,
            )

        with sp.else_():
            self.initTransaction(transactionId.open_some(), offer=offer,
                                 fee=fee, secret=secret, description=description, title=title, duration=duration)
            self.data.parties[transactionId.open_some()] = sp.record(
                owner=sp.some(sp.sender),
                counterparty=sp.none,
            )

    @sp.entry_point
    def setCommissionDetails(self, owner, transactionId, counterparty, duration, offer, fee, secret, description, title):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        sp.set_type(owner, sp.TAddress)
        sp.set_type(counterparty, sp.TAddress)
        sp.set_type(duration, sp.TNat)
        sp.set_type(offer, sp.TMutez)
        sp.set_type(fee, sp.TMutez)
        sp.set_type(secret, sp.TString)
        sp.set_type(description, sp.TString)
        sp.set_type(title, sp.TString)

        self.data.parties[transactionId].owner = sp.some(
            owner)
        self.data.parties[transactionId].counterparty = sp.some(
            counterparty)

        transaction = self.data.transactions[transactionId]

        transaction.duration = duration
        transaction.offer = offer
        transaction.fee = fee
        transaction.hashedSecret = sp.some(
            sp.blake2b(sp.pack(secret)))
        transaction.description = description
        transaction.title = title
        transaction.status = sp.int(1)

    @sp.entry_point
    def setCommissionStatus(self, transactionId, status):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        transaction = self.data.transactions[transactionId]

        sp.set_type(status, sp.TInt)
        transaction.status = status

    @sp.entry_point
    def setTransactionEpoch(self, transactionId, epoch):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        sp.set_type(epoch, sp.TTimestamp)

        self.data.transactions[transactionId].epoch = epoch

    @sp.entry_point
    def setTransactionDuration(self, transactionId, duration):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        sp.set_type(duration, sp.TNat)

        self.data.transactions[transactionId].duration = duration

    @sp.entry_point
    def setCommissionParticipants(self, transactionId, owner, counterparty):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")
        sp.verify(self.data.parties[transactionId].owner == sp.none,
                  "Owner already set.")
        sp.verify(self.data.parties[transactionId].counterparty == sp.none,
                  "Counterparty already set.")

        sp.set_type(owner, sp.TAddress)
        sp.set_type(counterparty, sp.TAddress)

        self.data.parties[transactionId].owner = sp.some(
            owner)
        self.data.parties[transactionId].counterparty = sp.some(
            counterparty)

    @sp.entry_point
    def setTransactionOwner(self, transactionId, owner):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        sp.set_type(owner, sp.TAddress)

        self.data.parties[transactionId].owner = sp.some(
            owner)

    @sp.entry_point
    def setTransactionCounterparty(self, transactionId, counterparty):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        sp.set_type(counterparty, sp.TAddress)

        self.data.parties[transactionId].counterparty = sp.some(
            counterparty)

    @sp.entry_point
    def setTransactionFromOwner(self, transactionId, offer):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        sp.set_type(offer, sp.TMutez)

        self.data.transactions[transactionId].offer = offer

    @sp.entry_point
    def setTransactionFromCounterparty(self, transactionId, fee):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        sp.set_type(fee, sp.TMutez)

        self.data.transactions[transactionId].fee = fee

    @sp.entry_point
    def setTransactionHashedSecret(self, transactionId, secret):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        sp.verify(sp.sender == self.data.master,
                  "Only admin can set transaction details.")

        sp.set_type(secret, sp.TString)

        self.data.transactions[transactionId].hashedSecret = sp.some(
            sp.blake2b(sp.pack(secret)))

    @ sp.entry_point
    def revertCommissionFunds(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.master == sp.sender,
                  "Only the admin can revert the commission funds.")

        transaction = self.data.transactions[transactionId]

        sp.verify(transaction.ownerHasWithdrawn == sp.bool(True),
                  "Owner did not cancel the commission.")
        sp.verify(transaction.counterpartyHasWithdrawn == sp.bool(True),
                  "Counterparty did not cancel the commission.")
        sp.verify(transaction.status != sp.int(2),
                  "Transaction has already been completed.")
        sp.verify(transaction.status != sp.int(-1),
                  "Transaction has already been reverted.")

        sp.send(self.data.parties[transactionId].owner.open_some(
        ), transaction.offer)
        sp.send(self.data.parties[transactionId].counterparty.open_some(
        ), transaction.fee)

        transaction.balanceOwner = sp.mutez(0)
        transaction.balanceCounterparty = sp.mutez(0)
        transaction.status = sp.int(-1)

    ### OWNER INTERFACES ###

    @sp.entry_point
    def activateCommission(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(sp.sender == self.data.parties[transactionId].owner.open_some(),
                  "Only owner can start transaction.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")
        sp.verify((transaction.balanceOwner != sp.mutez(0)) & (transaction.balanceCounterparty != sp.mutez(0)),
                  "Both parties must deposit first!")

        transaction.epoch = sp.now.add_seconds(sp.to_int(transaction.duration))
        transaction.status = sp.int(1)

    @sp.entry_point
    def editCommisionReward(self, transactionId, newFromOwner):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].owner == sp.some(sp.sender),
                  "Only the owner can edit the commission reward.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")
        sp.verify(transaction.balanceOwner == sp.mutez(0),
                  "Owner has already deposited.")

        sp.set_type(newFromOwner, sp.TMutez)
        transaction.offer = newFromOwner

    @sp.entry_point
    def editCommisionFee(self, transactionId, newFromCounterparty):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].owner == sp.some(sp.sender),
                  "Only the owner can edit the commission fee.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")
        sp.verify(transaction.balanceCounterparty == sp.mutez(0),
                  "Counterparty has already deposited.")

        sp.set_type(newFromCounterparty, sp.TMutez)
        transaction.fee = newFromCounterparty

    @sp.entry_point
    def editCommisionDetails(self, transactionId, newDetails):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].owner == sp.some(sp.sender),
                  "Only the owner can edit the commission details.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")

        sp.set_type(newDetails, sp.TString)
        transaction.description = newDetails

    @sp.entry_point
    def editCommisionDuration(self, transactionId, newDuration):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].owner == sp.some(sp.sender),
                  "Only the owner can edit the commission description.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")

        sp.set_type(newDuration, sp.TNat)
        transaction.duration = newDuration

    @sp.entry_point
    def editCommisionSecret(self, transactionId, newSecret):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].owner == sp.some(sp.sender),
                  "Only the owner can edit the commission details.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")

        sp.set_type(newSecret, sp.TString)
        transaction.hashedSecret = sp.some(sp.blake2b(sp.pack(newSecret)))

    @ sp.entry_point
    def cancelCommissionOwner(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].owner == sp.some(sp.sender),
                  "Only the owner can cancel the commission.")

        self.data.transactions[transactionId].ownerHasWithdrawn = ~self.data.transactions[transactionId].ownerHasWithdrawn

    @ sp.entry_point
    def deleteCommission(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].owner == sp.some(sp.sender),
                  "Only the owner can delete the commission.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status != sp.int(0),
                  "Transaction is not pending.")

        with sp.if_(transaction.balanceOwner != sp.mutez(0)):
            sp.send(sp.sender, transaction.balanceOwner, sp.tez(0))

        del self.data.transactions[transactionId]
        del self.data.parties[transactionId]

    @sp.entry_point
    def depositOwner(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")
        sp.verify(self.data.parties[transactionId].owner == sp.some(sp.sender),
                  "Only the owner can deposit funds.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.balanceOwner == sp.tez(0),
                  "Owner already deposited funds.")
        sp.verify(sp.amount == transaction.offer,
                  "Amount does not match offer.")

        transaction.balanceOwner += sp.amount

    ### COUNTERPARTY INTERFACES ###

    @ sp.entry_point
    def acceptCommission(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].counterparty == sp.none,
                  "Transaction already has a counterparty.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")

        self.data.parties[transactionId].counterparty = sp.some(
            sp.sender)

    @ sp.entry_point
    def cancelCommissionCounterparty(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(self.data.parties[transactionId].counterparty == sp.some(sp.sender),
                  "Only the counterparty can cancel the commission.")

        transaction = self.data.transactions[transactionId]
        sp.verify((transaction.balanceOwner != sp.tez(0)) & (transaction.balanceCounterparty != sp.tez(0)),
                  "Nobody has deposited funds yet. Leave the commission instead.")

        transaction.counterpartyHasWithdrawn = ~transaction.counterpartyHasWithdrawn

    @sp.entry_point
    def depositCounterparty(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        transaction = self.data.transactions[transactionId]
        party = self.data.parties[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")
        sp.verify(party.counterparty == sp.some(sp.sender),
                  "Only the counterparty can deposit funds.")
        sp.verify(transaction.balanceCounterparty == sp.tez(0),
                  "Counterparty already deposited funds.")
        sp.verify(sp.amount == transaction.fee,
                  "Amount does not match fee.")

        self.data.transactions[transactionId].balanceCounterparty += sp.amount

    @sp.entry_point
    def leaveCommission(self, transactionId):
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")
        sp.verify(self.data.parties[transactionId].counterparty == sp.some(sp.sender),
                  "Only the counterparty can leave the commission.")

        sp.verify(transaction.balanceCounterparty == sp.tez(0),
                  "Funds are deposited. Request for cancellation instead.")

        self.data.parties[transactionId].counterparty = sp.none

    ### OWNER AND COUNTERPARTY INTERFACES ###
    @sp.entry_point
    def approveCommission(self, transactionId):
        owner = self.data.parties[transactionId].owner.open_some(
        )
        sp.set_type(transactionId, sp.TString)
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")

        transaction = self.data.transactions[transactionId]
        sp.verify(transaction.status == sp.int(0),
                  "Transaction is not pending.")

        sp.verify(transaction.balanceOwner == transaction.offer,
                  "Owner did not deposit funds.")
        sp.verify(transaction.balanceCounterparty == transaction.fee,
                  "Counterparty did not deposit funds.")
        sp.verify(sp.sender == owner,
                  "Only the owner can approve the commission.")

        transaction.epoch = sp.now.add_seconds(sp.to_int(transaction.duration))
        transaction.status = sp.int(1)

    def claim(self, identity, transactionId):
        sp.set_type(identity, sp.TAddress)
        sp.set_type(transactionId, sp.TString)

        transaction = self.data.transactions[transactionId]

        sp.verify(transaction.status == sp.int(1),
                  "Transaction is not active.")
        sp.verify((transaction.balanceOwner == transaction.offer) & (transaction.balanceCounterparty == transaction.fee),
                  "Both parties must deposit!")

        sp.verify(sp.sender == identity,
                  "Only the owner or counterparty can claim!")

        sp.send(identity, transaction.balanceOwner +
                transaction.balanceCounterparty)
        transaction.balanceOwner = sp.tez(0)
        transaction.balanceCounterparty = sp.tez(0)
        transaction.status = sp.int(2)

    @sp.entry_point
    def claimCounterparty(self, transactionId, secret):
        counterparty = self.data.parties[transactionId].counterparty.open_some(
        )
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(sp.sender == counterparty,
                  "Only the counterparty can claim!")

        transaction = self.data.transactions[transactionId]

        sp.verify(~transaction.counterpartyHasWithdrawn,
                  "Counterparty pending withdrawal from commission!")

        sp.verify(transaction.epoch > sp.now,
                  "Commission duration expired!")
        sp.set_type(secret.open_some(), sp.TString)
        sp.verify(transaction.hashedSecret.open_some()
                  == sp.blake2b(sp.pack(secret.open_some())), "Secret does not match!")

        self.claim(counterparty, transactionId)

    @sp.entry_point
    def claimOwner(self, transactionId):
        owner = self.data.parties[transactionId].owner.open_some(
        )
        sp.verify(self.data.transactions.contains(transactionId),
                  "Transaction does not exist.")
        sp.verify(sp.sender == owner, "Only the owner can claim!")

        transaction = self.data.transactions[transactionId]

        sp.verify(~transaction.ownerHasWithdrawn,
                  "Owner pending withdrawal from commission!")
        sp.verify(transaction.epoch < sp.now,
                  "Commission duration not finished!")

        self.claim(owner, transactionId)


@ sp.add_test(name="Escrow")
def test():
    scenario = sp.test_scenario()
    scenario.h1("Escrow")

    admin = sp.address("tz1M2aPGQJpXBfXX9LPgDuj6vAv4K2pi14Pf")
    owner = sp.address("tz1XzLbkKor5e41sQRJfUu1bg22tVG3qBDDq")
    counterparty = sp.address("tz1QmCWR2fzy3niEDodkyjMS44aUVYyFWdTF")

    c1 = Escrow(
        admin,
    )

    scenario += c1

    ### create_transaction ###
    scenario.h2("Create transaction")
    scenario += c1.createCommission(sp.some("first")).run(sender=admin)
    scenario += c1.setCommissionDetails(
        title="Cat caretaker",
        owner=owner,
        counterparty=counterparty,
        transactionId="first",
        offer=sp.tez(100),
        fee=sp.tez(1),
        duration=100,
        description="Need someone to take care of my cat in 100 seconds!",
        secret="secret_key!"
    ).run(sender=admin)

    scenario += c1.setCommissionStatus(
        transactionId="first",
        status=sp.int(0)
    ).run(sender=admin)

    scenario.h2("Set participants")
    scenario += c1.setCommissionParticipants(
        owner=owner,
        counterparty=counterparty,
        transactionId="first"
    ).run(sender=admin, valid=False)

    scenario.h2("Deposit owner")
    scenario += c1.depositOwner(
        "first"
    ).run(sender=owner, amount=sp.tez(50), valid=False)
    scenario += c1.depositOwner(
        "first"
    ).run(sender=owner, amount=sp.tez(100), valid=True)
    scenario += c1.depositOwner(
        "first"
    ).run(sender=owner, amount=sp.tez(100), valid=False)

    scenario.h2("Deposit counterparty")
    scenario += c1.depositCounterparty(
        "first"
    ).run(sender=counterparty, amount=sp.tez(2), valid=False)
    scenario += c1.depositCounterparty(
        "first"
    ).run(sender=counterparty, amount=sp.tez(1), valid=True)
    scenario += c1.depositCounterparty(
        "first"
    ).run(sender=counterparty, amount=sp.tez(1), valid=False)

    scenario.h2("Activate transaction")
    scenario += c1.activateCommission(
        "first"
    ).run(sender=owner, valid=True)

    scenario.h2("Claim owner")
    scenario += c1.claimOwner(
        "first"
    ).run(sender=owner, now=sp.timestamp(125))
    scenario += c1.claimCounterparty(
        transactionId="first",
        secret=sp.some("secret_key!")
    ).run(sender=counterparty, valid=False)

    scenario.h2("Reset escrow")
    scenario += c1.resetEscrow().run(sender=admin)

    ### owner posts commission ###

    scenario.h2("Create transaction")
    scenario += c1.postCommission(
        transactionId=sp.some("second"),
        offer=sp.tez(100),
        fee=sp.tez(1),
        duration=100,
        title="[URGENT] Rat killer ninja needed!",
        description="I need a rat killer ninja to kill my rats.",
        secret="rat_killers_are_cool!"
    ).run(sender=owner, valid=True)

    scenario.h2("Accept commission")
    scenario += c1.acceptCommission(
        "second"
    ).run(sender=counterparty, valid=True)

    scenario.h2("Deposit owner")
    scenario += c1.depositOwner(
        "second"
    ).run(sender=owner, amount=sp.tez(100), valid=True)

    scenario.h2("Deposit counterparty")
    scenario += c1.depositCounterparty(
        "second"
    ).run(sender=counterparty, amount=sp.tez(1), valid=True)

    scenario.h2("Activate transaction")
    scenario += c1.activateCommission(
        "second"
    ).run(sender=owner, valid=True)

    scenario.h2("Claim counterparty")
    scenario += c1.claimCounterparty(
        transactionId="second",
        secret=sp.some("rat_killers_are_cool!")
    ).run(sender=counterparty, now=sp.timestamp(20), valid=True)
    scenario.h2("Claim owner")
    scenario += c1.claimOwner(
        "second"
    ).run(sender=owner, now=sp.timestamp(125), valid=False)

    scenario.h2("Withdraw")
    scenario.h2("Post Commission and Withdraw")
    scenario += c1.postCommission(
        transactionId=sp.some("third"),
        offer=sp.tez(100),
        fee=sp.tez(1),
        duration=100,
        title="[URGENT] Rat killer ninja needed!",
        description="I need a rat killer ninja to kill my rats.",
        secret="ratatouille"
    ).run(sender=owner, valid=True)

    scenario.h2("Accept commission")
    scenario += c1.acceptCommission(
        "third"
    ).run(sender=counterparty, valid=True)

    scenario.h2("Deposit owner")
    scenario += c1.depositOwner(
        "third"
    ).run(sender=owner, amount=sp.tez(100), valid=True)

    scenario.h2("Deposit counterparty")
    scenario += c1.depositCounterparty(
        "third"
    ).run(sender=counterparty, amount=sp.tez(1), valid=True)

    scenario.h2("Activate transaction")
    scenario += c1.activateCommission(
        "third"
    ).run(sender=owner, valid=True)

    scenario.h2("Cancel commission owner")
    scenario += c1.cancelCommissionOwner(
        "third"
    ).run(sender=owner, valid=True)

    scenario.h2("Try revert funds")
    scenario += c1.revertCommissionFunds(
        "third"
    ).run(sender=admin, valid=False)

    scenario.h2("Cancel commission counterparty")
    scenario += c1.cancelCommissionCounterparty(
        "third"
    ).run(sender=counterparty, valid=True)

    scenario.h2("Revert funds")
    scenario += c1.revertCommissionFunds(
        "third"
    ).run(sender=admin, valid=True)

    scenario.h2("Counterparty leaves before the transaction is active")
    scenario += c1.postCommission(
        transactionId=sp.some("fourth"),
        offer=sp.tez(100),
        fee=sp.tez(1),
        duration=100,
        title="[URGENT] Rat killer ninja needed!",
        description="I need a rat killer ninja to kill my rats.",
        secret="rat_killers_are_cool!"
    ).run(sender=owner, valid=True)

    scenario.h2("Accept commission")
    scenario += c1.acceptCommission(
        "fourth"
    ).run(sender=counterparty, valid=True)

    scenario.h2("Leave commission")
    scenario += c1.leaveCommission(
        "fourth"
    ).run(sender=counterparty, valid=True)

    scenario.h2("Try revert funds")
    scenario += c1.revertCommissionFunds(
        "fourth"
    ).run(sender=admin, valid=False)

    scenario.h2("Owner tries to activate transaction")
    scenario += c1.activateCommission(
        "fourth"
    ).run(sender=owner, valid=False)

    scenario.h2("Counterparty joins again")
    scenario += c1.acceptCommission(
        "fourth"
    ).run(sender=counterparty, valid=True)

    scenario.h2("Activate transaction")
    scenario += c1.activateCommission(
        "fourth"
    ).run(sender=owner, valid=False)

    scenario.h2("Owner deposits")
    scenario += c1.depositCounterparty(
        "fourth"
    ).run(sender=counterparty, amount=sp.tez(1), valid=True)

    scenario.h2("Counterparty tries to leave")
    scenario += c1.leaveCommission(
        "fourth"
    ).run(sender=counterparty, valid=False)
    scenario += c1.postCommission(
        transactionId=sp.none,
        offer=sp.tez(100),
        fee=sp.tez(1),
        duration=100,
        title="[URGENT] Rat killer ninja needed!",
        description="I need a rat killer ninja to kill my rats.",
        secret="rat_killers_are_cool!"
    ).run(sender=counterparty, valid=True)


sp.add_compilation_target(
    "escrow",
    Escrow(sp.address("tz1M2aPGQJpXBfXX9LPgDuj6vAv4K2pi14Pf"))
)
